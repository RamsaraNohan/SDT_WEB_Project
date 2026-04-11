namespace BlindMatch.Application.Interfaces;

public interface INotificationService
{
    Task SendInterestReceivedEmailAsync(string studentEmail, string proposalTitle);
    Task SendMatchConfirmedEmailAsync(string studentEmail, string supervisorEmail, string proposalTitle);
    Task SendProposalRejectedEmailAsync(string studentEmail, string proposalTitle, string reason);
    Task SendDeadlineReminderEmailAsync(string studentEmail, string proposalTitle, DateTime deadline);
    Task SendScoreRatifiedEmailAsync(string studentEmail, string proposalTitle);
}
