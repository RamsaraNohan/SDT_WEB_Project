using BlindMatch.Application.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BlindMatch.Application.Matches.Commands;

public record ExpressInterestCommand : IRequest
{
    public Guid ProposalId { get; init; }
}

public class ExpressInterestCommandHandler : IRequestHandler<ExpressInterestCommand>
{
    private readonly IMatchingService _matchingService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ExpressInterestCommandHandler> _logger;

    public ExpressInterestCommandHandler(
        IMatchingService matchingService, 
        ICurrentUserService currentUserService,
        ILogger<ExpressInterestCommandHandler> logger)
    {
        _matchingService = matchingService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task Handle(ExpressInterestCommand request, CancellationToken cancellationToken)
    {
        var supervisorId = _currentUserService.UserId ?? throw new UnauthorizedAccessException();
        
        _logger.LogInformation("Supervisor {SupervisorId} expressing interest in proposal {ProposalId}", supervisorId, request.ProposalId);
        
        await _matchingService.ExpressInterestAsync(supervisorId, request.ProposalId);
    }
}
