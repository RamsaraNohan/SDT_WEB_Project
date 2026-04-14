using Microsoft.IdentityModel.Tokens;
using System.Text;
using BlindMatch.Application.Common.Security;
using BlindMatch.Application;
using BlindMatch.Application.Interfaces;
using BlindMatch.Domain.Entities;
using BlindMatch.Infrastructure.Persistence;
using BlindMatch.Infrastructure.Services;
using BlindMatch.Infrastructure.Security;
using BlindMatch.API.Middleware;
using BlindMatch.API.Controllers;
using Hangfire;
using Microsoft.AspNetCore.Identity;
using Hangfire.SqlServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Serilog;
using Serilog.Events;

try
{
    var builder = WebApplication.CreateBuilder(args);

    // 🔥 1. SERILOG CONFIGURATION (Phased to Console/File)
    Log.Logger = new LoggerConfiguration()
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "BlindMatch-API")
        .WriteTo.Console()
        .WriteTo.File("logs/startup-crash-.log", rollingInterval: RollingInterval.Day)
        .CreateLogger();

    builder.Host.UseSerilog();

    // Add services to the container.
    builder.Services.AddHttpContextAccessor();

    var jwtSettings = new JwtSettings();
    builder.Configuration.Bind(JwtSettings.SectionName, jwtSettings);
    builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));

    // 🔥 1. PRE-FLIGHT CONFIGURATION GUARD
    if (string.IsNullOrEmpty(jwtSettings.Secret) || jwtSettings.Secret.Length < 32)
    {
        Log.Error("❌ CRITICAL: JWT Secret is MISSING or too short (Min 32 chars). Check your Azure App Service Settings.");
    }

    // 🔥 1. DATABASE & DI BRIDGE
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                        ?? builder.Configuration["ConnectionStrings__DefaultConnection"] // Prioritize Azure System Name
                        ?? builder.Configuration["ConnectionStrings:DefaultConnection"];

    if (string.IsNullOrEmpty(connectionString))
    {
        Log.Error("🚨 CRITICAL: No connection string found in Azure environment!");
        // We set a dummy string to prevent DI crashes, so diagnostic tools can run
        connectionString = "Server=NO_AZURE_CONNECTION_STRING_FOUND;Database=None;";
    }

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString,
            b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
                  .CommandTimeout(180))); // Increased to 3 mins for Azure Cold Start

    // Bridge the Interface to the Class
    builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

    // 🔥 2. IDENTITY ENGINE
    builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequiredLength = 8;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
        };

        // 🔥 SIGNALR ACCESS TOKEN (READ FROM QUERY STRING)
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

    // 🔥 2. NON-BLOCKING HANGFIRE
    builder.Services.AddHangfire(config => config
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseSqlServerStorage(connectionString, new SqlServerStorageOptions 
        { 
            CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
            SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
            QueuePollInterval = TimeSpan.Zero,
            UseRecommendedIsolationLevel = true,
            DisableGlobalLocks = true // Safe for Azure SQL
        }));

    builder.Services.AddHangfireServer();

    // 🔥 2. AZURE MANAGED SIGNALR SERVICE (Safe check for typos)
    var signalRConnectionString = builder.Configuration["Azure:SignalR:ConnectionString"] 
                                ?? builder.Configuration["Azure:SignalR:ConnectionStrng"]; // Support portal typo

    if (!string.IsNullOrEmpty(signalRConnectionString))
    {
        builder.Services.AddSignalR().AddAzureSignalR(signalRConnectionString);
    }
    else
    {
        builder.Services.AddSignalR();
    }

    builder.Services.AddHealthChecks();

    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("RequireStudentRole", policy => policy.RequireRole("Student"));
        options.AddPolicy("RequireSupervisorRole", policy => policy.RequireRole("Supervisor"));
        options.AddPolicy("RequireModuleLeaderRole", policy => policy.RequireRole("ModuleLeader"));
        options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
    });

    builder.Services.AddApplication();
    builder.Services.AddScoped<IIdentityService, IdentityService>();
    builder.Services.AddScoped<INotificationService, NotificationService>();
    builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

    // 🔥 3. PRODUCTION CORS POLICY (Industry Standard for SignalR)
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins("https://lemon-wave-05930bd00.7.azurestaticapps.net")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // ⚠️ REQUIRED FOR SIGNALR
        });
    });

    builder.Services.AddControllers().AddApplicationPart(typeof(AuthController).Assembly);
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    var app = builder.Build();

    // 🚀 THE INSTANT TRUTH-REPORTER (Prevents 500.37 Timeout)
    bool hasCredentials = connectionString.Contains("User ID") || connectionString.Contains("Password");
    if (!hasCredentials || connectionString.Contains("NO_AZURE_CONNECTION_STRING_FOUND"))
    {
        app.MapGet("/", () => Results.Problem(
            detail: "Your connection string in the Azure Portal is missing or invalid. Please check the Configuration/Connection Strings section for 'DefaultConnection'.",
            title: "Azure Configuration Warning",
            statusCode: 500));
        
        // We still allow the app to run so /api/auth/diagnostic can be hit
    }

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();

    // 🔥 4. ENABLE ROUTING & CORS (Correct Standard Order)
    app.UseRouting();
    app.UseCors("AllowFrontend");

    // 🔥 5. OBSERVABILITY MIDDLEWARE
    app.UseMiddleware<CorrelationIdMiddleware>();

    app.UseAuthentication();
    app.UseAuthorization();

    // 🚀 6. ROOT ROUTE
    app.MapGet("/", () => Results.Ok(new 
    { 
        Status = "Healthy", 
        System = "NSBM Project Tracker API", 
        Environment = "Production",
        Version = "2.0.0",
        Timestamp = DateTime.UtcNow
    }));

    // 🚀 7. HEALTH CHECK ENDPOINT (For Docker)
    app.MapHealthChecks("/health");

    app.UseHangfireDashboard();

    app.MapControllers();
    app.MapHub<BlindMatch.API.Hubs.RevealHub>("/hubs/reveal");

    // 🔥 2. ZERO-DOWNTIME MIGRATION BRIDGE
    // We run migrations in the background to prevent Azure 500.37 Startup timeouts
    _ = Task.Run(async () => {
        try {
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<ApplicationDbContext>();
                var userManager = services.GetRequiredService<UserManager<User>>();
                var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
                await context.Database.MigrateAsync();

                Log.Information("🚀 BACKGROUND STAGE 2: Starting Database Seeding...");
                await DatabaseSeeder.SeedAsync(context, userManager, roleManager);
                
                Log.Information("🚀 BACKGROUND STAGE 3: System Fully Synchronized.");
            }
        }
        catch (Exception ex) {
            Log.Error(ex, "❌ Background Migration Failed");
        }
    });

    app.Run();
}
catch (Exception ex)
{
    // 🔥 THE GLOBAL STARTUP SNIFFER
    // If the app crashes during DI or Startup, this will return the error instead of a blank 500
    var builder = WebApplication.CreateBuilder(args);
    var app = builder.Build();
    app.MapGet("/", () => Results.Problem(
        detail: ex.Message,
        title: "Startup Fatal Error",
        statusCode: 500));
    app.Run();
}
