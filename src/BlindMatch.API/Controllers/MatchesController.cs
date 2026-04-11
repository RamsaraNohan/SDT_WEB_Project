using BlindMatch.Application.Matches.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlindMatch.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MatchesController : ControllerBase
{
    private readonly IMediator _mediator;

    public MatchesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [Authorize(Policy = "RequireSupervisorRole")]
    [HttpPost("express-interest")]
    public async Task<IActionResult> ExpressInterest([FromBody] ExpressInterestCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { message = "Interest recorded successfully." });
    }

    [Authorize(Policy = "RequireSupervisorRole")]
    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmMatch([FromBody] ConfirmMatchCommand command)
    {
        try
        {
            await _mediator.Send(command);
            return Ok(new { message = "Match confirmed. Identities have been revealed." });
        }
        catch (InvalidOperationException ex) when (ex.Message == "CAPACITY_EXCEEDED")
        {
            return BadRequest(new { message = "You have reached your maximum supervision capacity." });
        }
    }
}
