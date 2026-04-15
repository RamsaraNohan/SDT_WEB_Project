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
    public async Task<IActionResult> Create([FromBody] SubmitProposalCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetMyProposals), new { }, new { id });
    }

    [Authorize(Policy = "RequireStudentRole")]
    [HttpPut("my/draft/{id}")]
    public async Task<IActionResult> UpdateDraft(Guid id, [FromBody] UpdateProposalDraftCommand command)
    {
        command.Id = id;
        await _mediator.Send(command);
        return NoContent();
    }

    [Authorize(Policy = "RequireStudentRole")]
    [HttpPost("my/submit/{id}")]
    public async Task<IActionResult> SubmitDraft(Guid id)
    {
        await _mediator.Send(new PublishProposalCommand { ProposalId = id });
        return NoContent();
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
