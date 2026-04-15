using BlindMatch.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace BlindMatch.Infrastructure.Services;

public class LocalBlobStorageService : IBlobStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<LocalBlobStorageService> _logger;
    private const string UploadFolderName = "uploads";
    private readonly string[] _allowedExtensions = { ".pdf", ".docx", ".png", ".jpg", ".jpeg" };

    public LocalBlobStorageService(IWebHostEnvironment environment, ILogger<LocalBlobStorageService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        
        if (!_allowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("FILE_TYPE_NOT_ALLOWED");
        }

        var uploadPath = Path.Combine(_environment.WebRootPath ?? "wwwroot", UploadFolderName);
        
        if (!Directory.Exists(uploadPath))
        {
            Directory.CreateDirectory(uploadPath);
        }

        // Use GUID for security and uniquely identifying files
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadPath, uniqueFileName);

        _logger.LogInformation("Uploading file to {FilePath}", filePath);

        using (var outputStream = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(outputStream);
        }

        // Return the relative URL (starting with /uploads/)
        return $"/{UploadFolderName}/{uniqueFileName}";
    }

    public Task<string> GeneratePresignedUrlAsync(string blobUrl, int expiryMinutes = 60)
    {
        // For local storage, the blobUrl is already a directly accessible relative path
        return Task.FromResult(blobUrl);
    }

    public Task DeleteFileAsync(string blobUrl)
    {
        try
        {
            var fileName = Path.GetFileName(blobUrl);
            var filePath = Path.Combine(_environment.WebRootPath ?? "wwwroot", UploadFolderName, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation("Deleted file {FilePath}", filePath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete file {BlobUrl}", blobUrl);
        }

        return Task.CompletedTask;
    }
}
