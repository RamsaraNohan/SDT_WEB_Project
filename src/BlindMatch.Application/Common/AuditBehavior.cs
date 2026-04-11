using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Entities;
using MediatR;
using System.Text.Json;

namespace BlindMatch.Application.Common;

public class AuditBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> 
    where TRequest : IRequest<TResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AuditBehavior(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        // We only audit Commands conventionally ending with "Command"
        if (!requestName.EndsWith("Command"))
        {
            return await next();
        }

        var response = await next();

        var log = new AuditLog
        {
            ActorId = _currentUserService.UserId,
            Action = requestName,
            EntityType = requestName.Replace("Command", ""),
            EntityId = Guid.Empty, // Would ideally be extracted from request or response
            NewValueJson = JsonSerializer.Serialize(request),
            IpAddress = _currentUserService.IpAddress,
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync(cancellationToken);

        return response;
    }
}
