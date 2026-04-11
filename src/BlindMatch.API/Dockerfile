# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore
COPY ["BlindMatch.API/BlindMatch.API.csproj", "BlindMatch.API/"]
COPY ["BlindMatch.Application/BlindMatch.Application.csproj", "BlindMatch.Application/"]
COPY ["BlindMatch.Domain/BlindMatch.Domain.csproj", "BlindMatch.Domain/"]
COPY ["BlindMatch.Infrastructure/BlindMatch.Infrastructure.csproj", "BlindMatch.Infrastructure/"]
RUN dotnet restore "BlindMatch.API/BlindMatch.API.csproj"

# Copy all and build
COPY . .
WORKDIR "/src/BlindMatch.API"
RUN dotnet build "BlindMatch.API.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "BlindMatch.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Production Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose ports
EXPOSE 8080
EXPOSE 8081

# Health Check (Production Standard)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "BlindMatch.API.dll"]
