using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlindMatch.API.Controllers;

[Authorize(Roles = "ModuleLeader,Admin")]
[ApiController]
[Route("api/[controller]")]
public class MetricsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public MetricsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var totalProposals = await _context.Proposals.CountAsync();
        var matchedProposals = await _context.Proposals.CountAsync(p => p.Status == ProposalStatus.Matched);
        var activeSupervisors = await _context.DomainUsers.CountAsync(); // Domain Users
        var totalReveals = await _context.StudentReveals.CountAsync();

        return Ok(new
        {
            MatchRate = totalProposals > 0 ? (double)matchedProposals / totalProposals * 100 : 0,
            TotalProposals = totalProposals,
            MatchedProposals = matchedProposals,
            ActiveSupervisors = activeSupervisors,
            IdentityReveals = totalReveals,
            SystemHealth = "Healthy"
        });
    }

    [HttpGet("supervisor-load")]
    public async Task<IActionResult> GetSupervisorLoad()
    {
        // Join Matches with ApplicationUsers for visual distribution
        var loadData = await _context.Matches
            .Where(m => m.State == MatchState.Confirmed)
            .GroupBy(m => m.SupervisorId)
            .Select(g => new
            {
                SupervisorId = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        return Ok(loadData);
    }

    [HttpGet("matching-trends")]
    public async Task<IActionResult> GetMatchingTrends()
    {
        // Distribution of proposals by status
        var trends = await _context.Proposals
            .GroupBy(p => p.Status)
            .Select(g => new
            {
                Status = g.Key.ToString(),
                Count = g.Count()
            })
            .ToListAsync();

        return Ok(trends);
    }
}
