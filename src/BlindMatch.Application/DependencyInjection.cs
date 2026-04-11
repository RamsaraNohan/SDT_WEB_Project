using BlindMatch.Application.Common;
using BlindMatch.Application.Interfaces;
using BlindMatch.Application.Services;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace BlindMatch.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddMediatR(cfg => {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(AuditBehavior<,>));
        });

        services.AddValidatorsFromAssembly(assembly);

        services.AddScoped<IAnonymisationService, AnonymisationService>();
        services.AddScoped<IRevealService, RevealService>();
        services.AddScoped<IMatchingService, MatchingService>();

        return services;
    }
}
