BEGIN TRANSACTION;
CREATE TABLE [dbo].[ProjectIterations] (
    [Id] uniqueidentifier NOT NULL,
    [MatchId] uniqueidentifier NOT NULL,
    [SubmissionContent] nvarchar(max) NOT NULL,
    [IterationNumber] int NOT NULL,
    [SubmittedAt] datetime2 NOT NULL,
    [SupervisorFeedback] nvarchar(max) NULL,
    [ReviewedAt] datetime2 NULL,
    [AssignedMarks] decimal(18,2) NULL,
    [Status] int NOT NULL,
    [IsDeleted] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_ProjectIterations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ProjectIterations_Matches_MatchId] FOREIGN KEY ([MatchId]) REFERENCES [dbo].[Matches] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_ProjectIterations_MatchId] ON [dbo].[ProjectIterations] ([MatchId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260415125259_AddProjectIterations', N'10.0.5');

COMMIT;
GO

