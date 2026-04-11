using BlindMatch.Application.Interfaces;
using Hangfire;
using Microsoft.Extensions.Logging;

namespace BlindMatch.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(IBackgroundJobClient backgroundJobClient, ILogger<NotificationService> logger)
    {
        _backgroundJobClient = backgroundJobClient;
        _logger = logger;
    }

    public Task SendInterestReceivedEmailAsync(string studentEmail, string proposalTitle)
    {
        _backgroundJobClient.Enqueue(() => SendEmailInternal(studentEmail, "New Interest in Your Proposal", $"A supervisor has expressed interest in your proposal: {proposalTitle}"));
        return Task.CompletedTask;
    }

    public Task SendMatchConfirmedEmailAsync(string studentEmail, string supervisorEmail, string proposalTitle)
    {
        _backgroundJobClient.Enqueue(() => SendEmailInternal(studentEmail, "MATCH CONFIRMED!", $"Your proposal '{proposalTitle}' has been matched! Check the portal for supervisor details."));
        _backgroundJobClient.Enqueue(() => SendEmailInternal(supervisorEmail, "MATCH CONFIRMED!", $"You have been matched with a student for proposal '{proposalTitle}'. Check the portal for details."));
        return Task.CompletedTask;
    }

    public Task SendProposalRejectedEmailAsync(string studentEmail, string proposalTitle, string reason)
    {
        _backgroundJobClient.Enqueue(() => SendEmailInternal(studentEmail, "Proposal Update", $"Your proposal '{proposalTitle}' requires revision. Reason: {reason}"));
        return Task.CompletedTask;
    }

    public Task SendDeadlineReminderEmailAsync(string studentEmail, string proposalTitle, DateTime deadline)
    {
        _backgroundJobClient.Enqueue(() => SendEmailInternal(studentEmail, "Deadline Reminder", $"Reminder: The deadline for '{proposalTitle}' is {deadline:dd/MM/yyyy}."));
        return Task.CompletedTask;
    }

    public Task SendScoreRatifiedEmailAsync(string studentEmail, string proposalTitle)
    {
        _backgroundJobClient.Enqueue(() => SendEmailInternal(studentEmail, "Grade Released", $"Your final grade for '{proposalTitle}' has been ratified and released."));
        return Task.CompletedTask;
    }

    // This method is called by Hangfire workers
    [System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never)]
    public void SendEmailInternal(string to, string subject, string body)
    {
        _logger.LogInformation("[EMAIL SENT] To: {To}, Subject: {Subject}, Body: {Body}", to, subject, body);
        // Actual SMTP logic would go here
    }
}
