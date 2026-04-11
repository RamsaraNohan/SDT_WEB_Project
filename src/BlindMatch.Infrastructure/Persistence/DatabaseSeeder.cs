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
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
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

        // 3. Seed Research Areas (Expanded based on Curriculum)
        if (!await context.ResearchAreas.AnyAsync())
        {
            var areas = new[]
            {
                "Artificial Intelligence", "Machine Learning", "Web Development", 
                "Mobile Development", "Cloud Computing", "Cybersecurity", 
                "Data Science", "IoT", "Software Engineering", 
                "Algorithms and Data Structures", "Database Management Systems",
                "Human-Computer Interaction", "Computer Graphics & Visualization",
                "Parallel & Distributed Computing", "Big Data Analytics",
                "Software Architecture", "Cryptography", "Enterprise Application Development"
            };
            
            foreach (var areaName in areas)
            {
                await context.ResearchAreas.AddAsync(new ResearchArea { Name = areaName });
            }
        }

        // 4. Seed Deadline Settings
        if (!await context.DeadlineSettings.AnyAsync())
        {
            var settings = new DeadlineSettings
            {
                Id = 1,
                ProposalOpenAt = DateTime.UtcNow.AddDays(-7),
                ProposalCloseAt = DateTime.UtcNow.AddMonths(1),
                FinalSubmissionDeadline = DateTime.UtcNow.AddMonths(6),
                MaxProjectsPerSupervisor = 4
            };
            await context.DeadlineSettings.AddAsync(settings);
        }

        await context.SaveChangesAsync();
    }
}
