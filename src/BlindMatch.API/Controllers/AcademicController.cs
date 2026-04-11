using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Entities;
using BlindMatch.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlindMatch.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AcademicController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public AcademicController(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    // --- MEETINGS ---

    [HttpPost("meetings")]
    public async Task<IActionResult> ScheduleMeeting([FromBody] SupervisionMeeting meeting)
    {
        // Only supervisors or students in the match can log meetings
        var match = await _context.Matches.FindAsync(meeting.MatchId);
        if (match == null) return NotFound("Match not found.");

        _context.SupervisionMeetings.Add(meeting);
        await _context.SaveChangesAsync();
        return Ok(meeting);
    }

    [HttpGet("meetings/{matchId}")]
    public async Task<IActionResult> GetMeetings(Guid matchId)
    {
        var meetings = await _context.SupervisionMeetings
            .Where(m => m.MatchId == matchId)
            .OrderByDescending(m => m.MeetingDate) // Correct Property
            .ToListAsync();
        return Ok(meetings);
    }

    // --- SUBMISSIONS ---

    [HttpPost("submissions")]
    public async Task<IActionResult> SubmitProject([FromBody] FinalSubmission submission)
    {
        // Check for matching via proposal
        var proposal = await _context.Proposals.FindAsync(submission.ProposalId);
        if (proposal == null) return NotFound("Proposal not found.");

        _context.FinalSubmissions.Add(submission);
        
        // Update proposal status
        proposal.Status = ProposalStatus.Submitted;

        await _context.SaveChangesAsync();
        return Ok(submission);
    }

    // --- SCORING ---

    [Authorize(Roles = "Supervisor,Admin")]
    [HttpPost("score")]
    public async Task<IActionResult> SubmitScore([FromBody] ProjectScore score)
    {
        var match = await _context.Matches.FindAsync(score.MatchId);
        if (match == null) return NotFound("Match not found.");

        // Check if already scored
        var existing = await _context.ProjectScores.FirstOrDefaultAsync(s => s.MatchId == score.MatchId);
        if (existing != null) return BadRequest("Project already scored.");

        _context.ProjectScores.Add(score);
        await _context.SaveChangesAsync();
        return Ok(score);
    }
}
