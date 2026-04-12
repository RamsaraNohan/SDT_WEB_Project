using BlindMatch.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;

namespace BlindMatch.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<Guid>> roleManager)
    {
        // 1. Seed Roles
        var roles = new[] { "Student", "Supervisor", "ModuleLeader", "Admin" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid> { Name = role });
            }
        }

        // 2. Seed Admin User
        var adminEmail = "admin@blindmatch.edu";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Administrator",
                IsActive = true,
                EmailConfirmed = true
            };
            await userManager.CreateAsync(adminUser, "Admin123!");
            await userManager.AddToRoleAsync(adminUser, "Admin");
            await userManager.AddToRoleAsync(adminUser, "ModuleLeader");
        }

        // 3. Seed Research Areas
        if (!await context.ResearchAreas.AnyAsync())
        {
            var areas = new[]
            {
                "Artificial Intelligence", "Machine Learning", "Web Development", 
                "Mobile Development", "Cloud Computing", "Cybersecurity", 
                "Data Science", "Software Engineering", "Enterprise Systems"
            };
            foreach (var area in areas)
            {
                await context.ResearchAreas.AddAsync(new ResearchArea { Name = area });
            }
            await context.SaveChangesAsync();
        }

        var allAreas = await context.ResearchAreas.ToListAsync();
        var password = "NSBM_Secure_2026!";

        // 4. Seed 5 Supervisors
        var supervisors = new List<ApplicationUser>();
        for (int i = 1; i <= 5; i++)
        {
            var email = $"supervisor-{i}@nsbm.ac.lk";
            if (await userManager.FindByEmailAsync(email) == null)
            {
                var user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = $"Prof. Academic {i}",
                    Department = "School of Computing",
                    IsActive = true,
                    EmailConfirmed = true
                };
                await userManager.CreateAsync(user, password);
                await userManager.AddToRoleAsync(user, "Supervisor");
                supervisors.Add(user);

                // Add Expertise for each supervisor
                await context.SupervisorExpertise.AddAsync(new SupervisorExpertise 
                { 
                    SupervisorId = user.Id, 
                    ResearchAreaId = allAreas[i % allAreas.Count].Id 
                });
            }
        }

        // 5. Seed 15 Students
        var students = new List<ApplicationUser>();
        for (int i = 1; i <= 15; i++)
        {
            var email = $"student-{i}@nsbm.ac.lk";
            if (await userManager.FindByEmailAsync(email) == null)
            {
                var user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = $"Student Name {i}",
                    IsGroupLead = i > 10, // last 5 are group leads
                    IsActive = true,
                    EmailConfirmed = true
                };
                await userManager.CreateAsync(user, password);
                await userManager.AddToRoleAsync(user, "Student");
                students.Add(user);
            }
        }

        // 6. Seed 7 Proposals (4 Individual, 3 Group)
        if (!await context.Proposals.AnyAsync())
        {
            for (int i = 0; i < 7; i++)
            {
                var isGroup = i >= 4;
                var student = isGroup ? students[10 + (i-4)] : students[i];
                
                var proposal = new Proposal
                {
                    AnonymousCode = $"PROP-2026-{(i+1):D3}",
                    Title = isGroup ? $"Group Innovation Project {i}" : $"Research Thesis {i}",
                    Abstract = "This is a comprehensive research abstract demonstrating the production capabilities of the NSBM Project Tracker.",
                    TechStack = "C#, .NET 10, React, Azure",
                    Status = (BlindMatch.Domain.Enums.ProposalStatus)(i % 4), // Mix of Draft, Published, etc.
                    StudentId = student.Id,
                    ResearchAreaId = allAreas[i % allAreas.Count].Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-i)
                };
                await context.Proposals.AddAsync(proposal);
            }
        }

        await context.SaveChangesAsync();
    }
}
