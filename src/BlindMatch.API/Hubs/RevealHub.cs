using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace BlindMatch.API.Hubs;

[Authorize]
public class RevealHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }
        await base.OnConnectedAsync();
    }

    public async Task JoinProposalGroup(string anonymousCode)
    {
        // Students and Supervisors involved in this proposal can join this group
        // In a real app, we'd verify authorization here
        await Groups.AddToGroupAsync(Context.ConnectionId, anonymousCode);
    }
}
