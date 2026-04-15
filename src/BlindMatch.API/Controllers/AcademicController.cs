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
    private readonly IMediator _mediator;

    public AcademicController(IApplicationDbContext context, ICurrentUserService currentUser, IMediator mediator)
    {
        _context = context;
        _currentUser = currentUser;
        _mediator = mediator;
    }

    // --- MEETINGS ---

    [HttpPost("meetings")]
    public async Task<IActionResult> ScheduleMeeting([FromBody] SupervisionMeeting meeting)
    {
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
            .OrderByDescending(m => m.MeetingDate)
            .ToListAsync();
        return Ok(meetings);
    }

    // --- ITERATIONS (NEW WORKFLOW) ---

    [HttpGet("iterations/{matchId}")]
    public async Task<IActionResult> GetIterations(Guid matchId)
    {
        var iterations = await _context.ProjectIterations
            .Where(i => i.MatchId == matchId)
            .OrderByDescending(i => i.IterationNumber)
            .ToListAsync();
        return Ok(iterations);
    }

    [HttpPost("iterations")]
    public async Task<IActionResult> SubmitIteration([FromBody] SubmitIterationCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { id });
    }

    [Authorize(Roles = "Supervisor,Admin")]
    [HttpPost("iterations/review")]
    public async Task<IActionResult> ReviewIteration([FromBody] ReviewIterationCommand command)
    {
        await _mediator.Send(command);
        return NoContent();
    }

    // --- FINAL SCORING ---

    [Authorize(Roles = "Supervisor,Admin")]
    [HttpPost("score")]
    public async Task<IActionResult> SubmitFinalScore([FromBody] ProjectScore score)
    {
        var match = await _context.Matches.FindAsync(score.MatchId);
        if (match == null) return NotFound("Match not found.");

        var existing = await _context.ProjectScores.FirstOrDefaultAsync(s => s.MatchId == score.MatchId);
        if (existing != null) 
        {
            existing.OverallScore = score.OverallScore;
            existing.SupervisorFeedback = score.SupervisorFeedback;
            existing.GradedAt = DateTime.UtcNow;
        }
        else
        {
            _context.ProjectScores.Add(score);
        }
        
        await _context.SaveChangesAsync();
        return Ok(score);
    }
}
