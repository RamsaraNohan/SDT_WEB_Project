using BlindMatch.Application.Proposals.Commands;
using BlindMatch.Application.Proposals.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlindMatch.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProposalsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProposalsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [Authorize(Policy = "RequireStudentRole")]
    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] SubmitProposalCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetMyProposals), new { }, new { id });
    }

    [AllowAnonymous]
    [HttpGet("areas")]
    public async Task<IActionResult> GetAreas()
    {
        var result = await _mediator.Send(new GetResearchAreasQuery());
        return Ok(result);
    }

    [Authorize(Policy = "RequireStudentRole")]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyProposals()
    {
        var result = await _mediator.Send(new GetStudentProposalsQuery());
        return Ok(result);
    }

    [Authorize(Policy = "RequireSupervisorRole")]
    [HttpGet("available")]
    public async Task<IActionResult> GetAvailableProposals()
    {
        var result = await _mediator.Send(new GetAvailableProposalsQuery());
        return Ok(result);
    }
}
