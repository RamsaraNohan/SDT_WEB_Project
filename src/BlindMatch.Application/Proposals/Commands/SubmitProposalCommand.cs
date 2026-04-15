using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Entities;
using BlindMatch.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BlindMatch.Application.Proposals.Commands;

public record SubmitProposalCommand : IRequest<Guid>
{
    public string Title { get; init; } = string.Empty;
    public string Abstract { get; init; } = string.Empty;
    public string TechStack { get; init; } = string.Empty;
    public Guid ResearchAreaId { get; init; }
    public string? PdfBlobUrl { get; init; }
}

public class SubmitProposalCommandHandler : IRequestHandler<SubmitProposalCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAnonymisationService _anonymisationService;
    private readonly ILogger<SubmitProposalCommandHandler> _logger;

    public SubmitProposalCommandHandler(
        IApplicationDbContext context, 
        ICurrentUserService currentUserService, 
        IAnonymisationService anonymisationService,
        ILogger<SubmitProposalCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _anonymisationService = anonymisationService;
        _logger = logger;
    }

    public async Task<Guid> Handle(SubmitProposalCommand request, CancellationToken cancellationToken)
    {
        var studentId = _currentUserService.UserId ?? throw new UnauthorizedAccessException();
        
        // 🔥 CONSTRAINT: 1 Active Proposal per Student
        var hasActiveProposal = await _context.Proposals
            .AnyAsync(p => p.StudentId == studentId && 
                          (p.Status == ProposalStatus.Pending || 
                           p.Status == ProposalStatus.UnderReview || 
                           p.Status == ProposalStatus.Matched),
                      cancellationToken);

        if (hasActiveProposal)
        {
            throw new InvalidOperationException("ALREADY_HAS_ACTIVE_PROPOSAL");
        }

        _logger.LogInformation("Submitting proposal for student {StudentId}", studentId);

        var proposal = new Proposal
        {
            Title = request.Title,
            Abstract = request.Abstract,
            TechStack = request.TechStack,
            ResearchAreaId = request.ResearchAreaId,
            StudentId = studentId,
            Status = ProposalStatus.Pending,
            AnonymousCode = _anonymisationService.GenerateAnonymousCode(),
            PdfBlobUrl = request.PdfBlobUrl
        };

        _context.Proposals.Add(proposal);
        await _context.SaveChangesAsync(cancellationToken);

        // Create the supervisor-facing public view
        await _anonymisationService.CreatePublicViewAsync(proposal.Id);

        return proposal.Id;
    }
}
