using FluentValidation;
using BlindMatch.Application.Matches.Commands;

namespace BlindMatch.Application.Matches.Validators;

public class ConfirmMatchCommandValidator : AbstractValidator<ConfirmMatchCommand>
{
    public ConfirmMatchCommandValidator()
    {
        RuleFor(v => v.ProposalId)
            .NotEmpty().WithMessage("Proposal ID is required.");
    }
}
