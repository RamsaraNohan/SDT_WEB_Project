using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Entities;
using BlindMatch.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BlindMatch.Application.Academic.Commands;

public record UploadIterationCommand : IRequest<Guid>
{
    public Guid MatchId { get; init; }
    public Stream FileStream { get; init; } = null!;
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long FileSize { get; init; }
}

public class UploadIterationCommandHandler : IRequestHandler<UploadIterationCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IBlobStorageService _storageService;
    private readonly ILogger<UploadIterationCommandHandler> _logger;
    private const long MaxFileSize = 50 * 1024 * 1024; // 50MB

    public UploadIterationCommandHandler(
        IApplicationDbContext context, 
        IBlobStorageService storageService,
        ILogger<UploadIterationCommandHandler> logger)
    {
        _context = context;
        _storageService = storageService;
        _logger = logger;
    }

    public async Task<Guid> Handle(UploadIterationCommand request, CancellationToken cancellationToken)
    {
        if (request.FileSize > MaxFileSize)
        {
            throw new InvalidOperationException("FILE_TOO_LARGE");
        }

        var match = await _context.Matches
            .Include(m => m.Proposal)
            .FirstOrDefaultAsync(m => m.Id == request.MatchId, cancellationToken);

        if (match == null || match.State != MatchState.Confirmed)
        {
            throw new InvalidOperationException("MATCH_NOT_FOUND_OR_NOT_CONFIRMED");
        }

        _logger.LogInformation("Uploading iteration for match {MatchId}, file {FileName}", request.MatchId, request.FileName);

        // 1. Upload file
        var fileUrl = await _storageService.UploadFileAsync(request.FileStream, request.FileName, request.ContentType);

        // 2. Determine Version Number (Forced versioning)
        var latestIteration = await _context.ProjectIterations
            .Where(i => i.MatchId == request.MatchId)
            .OrderByDescending(i => i.IterationNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var nextVersion = (latestIteration?.IterationNumber ?? 0) + 1;

        // 3. Create Iteration Record
        var iteration = new ProjectIteration
        {
            MatchId = request.MatchId,
            IterationNumber = nextVersion,
            SubmissionContent = $"Version {nextVersion} submission.", // Optional description
            FileName = request.FileName,
            FileUrl = fileUrl,
            FileType = request.ContentType,
            FileSize = request.FileSize,
            SubmittedAt = DateTime.UtcNow,
            Status = IterationStatus.Submitted
        };

        _context.ProjectIterations.Add(iteration);
        await _context.SaveChangesAsync(cancellationToken);

        return iteration.Id;
    }
}
