using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Entities;
using BlindMatch.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlindMatch.Application.Academic.Commands;
using MediatR;

namespace BlindMatch.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AcademicController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IMediator _mediator;

    public AcademicController(IApplicationDbContext context, ICurrentUserService currentUser, IMediator mediator)
    {
        _context = context;
        _currentUser = currentUser;
        _mediator = mediator;
    }

    [AllowAnonymous]
    [HttpGet("ping")]
    public IActionResult Ping() => Ok(new { Message = "AcademicController is LIVE", Version = "2.1.1" });

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

    public class UploadIterationRequest
    {
        public Guid MatchId { get; set; }
        public IFormFile File { get; set; } = null!;
    }

    [HttpPost("iterations/upload")]
    [RequestSizeLimit(52428800)] // 50MB
    public async Task<IActionResult> UploadIteration([FromForm] UploadIterationRequest request)
    {
        if (request.File == null || request.File.Length == 0)
            return BadRequest("No file uploaded.");

        var command = new UploadIterationCommand
        {
            MatchId = request.MatchId,
            FileName = request.File.FileName,
            ContentType = request.File.ContentType,
            FileSize = request.File.Length,
            FileStream = request.File.OpenReadStream()
        };

        try
        {
            var id = await _mediator.Send(command);
            return Ok(new { id });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }



    [Authorize(Roles = "Supervisor,Admin")]
    [HttpPost("iterations/review")]
    public async Task<IActionResult> ReviewIteration([FromBody] ReviewIterationCommand command)
    {
        await _mediator.Send(command);
        return NoContent();
    }

    // --- FINAL SCORING ---

    [HttpGet("score/{matchId}")]
    public async Task<IActionResult> GetFinalScore(Guid matchId)
    {
        var score = await _context.ProjectScores
            .FirstOrDefaultAsync(s => s.MatchId == matchId);
        
        if (score == null) return Ok(null);
        return Ok(score);
    }

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
