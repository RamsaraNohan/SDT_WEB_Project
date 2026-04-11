using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BlindMatch.Application.Services;

public class RevealService : IRevealService
{
    private readonly IApplicationDbContext _context;

    public RevealService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task RevealIdentitiesAsync(Guid matchId)
    {
        var match = await _context.Matches
            .Include(m => m.Proposal)
                .ThenInclude(p => p.Student)
            .Include(m => m.Supervisor)
            .FirstOrDefaultAsync(m => m.Id == matchId);

        if (match == null) return;

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Create StudentReveal (Supervisor details for Student)
            var studentReveal = new StudentReveal
            {
                MatchId = match.Id,
                StudentName = match.Proposal.Student.FullName,
                StudentEmail = match.Proposal.Student.Email,
                StudentPhone = match.Proposal.Student.PhoneNumber,
                GroupMembersJson = null, // Logic for group members can be added here
                PdfDownloadUrl = match.Proposal.PdfBlobUrl
            };

            // 2. Create SupervisorReveal (Student details for Supervisor)
            var supervisorReveal = new SupervisorReveal
            {
                MatchId = match.Id,
                SupervisorName = match.Supervisor.FullName,
                SupervisorEmail = match.Supervisor.Email,
                SupervisorOffice = match.Supervisor.OfficeLocation,
                FacultyPageUrl = match.Supervisor.FacultyPageUrl
            };

            await _context.StudentReveals.AddAsync(studentReveal);
            await _context.SupervisorReveals.AddAsync(supervisorReveal);

            match.RevealedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // 3. Trigger SignalR and Emails (Implementations will come in later layers)
            // TODO: SignalR broadcast
            // TODO: Hangfire enqueue emails
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
