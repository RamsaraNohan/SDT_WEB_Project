using BlindMatch.Application.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BlindMatch.Application.Matches.Commands;

public record ConfirmMatchCommand : IRequest
{
    public Guid ProposalId { get; init; }
}

public class ConfirmMatchCommandHandler : IRequestHandler<ConfirmMatchCommand>
{
    private readonly IMatchingService _matchingService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ConfirmMatchCommandHandler> _logger;

    public ConfirmMatchCommandHandler(
        IMatchingService matchingService, 
        ICurrentUserService currentUserService,
        ILogger<ConfirmMatchCommandHandler> logger)
    {
        _matchingService = matchingService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task Handle(ConfirmMatchCommand request, CancellationToken cancellationToken)
    {
        var supervisorId = _currentUserService.UserId ?? throw new UnauthorizedAccessException();
        
        _logger.LogInformation("Supervisor {SupervisorId} confirming match for proposal {ProposalId}", supervisorId, request.ProposalId);
        
        await _matchingService.ConfirmMatchAsync(supervisorId, request.ProposalId);
    }
}
