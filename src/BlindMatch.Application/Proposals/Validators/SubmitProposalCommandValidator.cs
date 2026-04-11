using FluentValidation;
using BlindMatch.Application.Proposals.Commands;

namespace BlindMatch.Application.Proposals.Validators;

public class SubmitProposalCommandValidator : AbstractValidator<SubmitProposalCommand>
{
    public SubmitProposalCommandValidator()
    {
        RuleFor(v => v.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(v => v.Abstract)
            .NotEmpty().WithMessage("Abstract is required.")
            .MinimumLength(100).WithMessage("Abstract must be at least 100 words.")
            .MaximumLength(2000).WithMessage("Abstract must not exceed 2000 characters.");

        RuleFor(v => v.TechStack)
            .NotEmpty().WithMessage("Tech Stack is required.")
            .MaximumLength(500).WithMessage("Tech Stack must not exceed 500 characters.");

        RuleFor(v => v.ResearchAreaId)
            .NotEmpty().WithMessage("Research Area is required.");

        RuleFor(v => v.PdfBlobUrl)
            .MaximumLength(500).WithMessage("PDF URL must not exceed 500 characters.");
    }
}
