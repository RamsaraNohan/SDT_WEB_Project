using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BlindMatch.Application.Proposals.Commands;

public class UpdateProposalDraftCommand : IRequest
{
    public Guid Id { get; set; }
    public string Title { get; init; } = string.Empty;
    public string Abstract { get; init; } = string.Empty;
    public string TechStack { get; init; } = string.Empty;
    public Guid ResearchAreaId { get; init; }
    public string? PdfBlobUrl { get; init; }
}

public class UpdateProposalDraftCommandHandler : IRequestHandler<UpdateProposalDraftCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateProposalDraftCommandHandler> _logger;

    public UpdateProposalDraftCommandHandler(
        IApplicationDbContext context, 
        ICurrentUserService currentUserService,
        ILogger<UpdateProposalDraftCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task Handle(UpdateProposalDraftCommand request, CancellationToken cancellationToken)
    {
        var studentId = _currentUserService.UserId ?? throw new UnauthorizedAccessException();

        var proposal = await _context.Proposals.FindAsync(new object[] { request.Id }, cancellationToken);

        if (proposal == null) throw new Exception("Proposal not found.");
        if (proposal.StudentId != studentId) throw new UnauthorizedAccessException();
        if (proposal.Status != ProposalStatus.Draft) throw new Exception("Only drafts can be updated.");

        proposal.Title = request.Title;
        proposal.Abstract = request.Abstract;
        proposal.TechStack = request.TechStack;
        proposal.ResearchAreaId = request.ResearchAreaId;
        proposal.PdfBlobUrl = request.PdfBlobUrl;

        await _context.SaveChangesAsync(cancellationToken);
        
        _logger.LogInformation("Updated draft proposal {ProposalId} for student {StudentId}", proposal.Id, studentId);
    }
}
