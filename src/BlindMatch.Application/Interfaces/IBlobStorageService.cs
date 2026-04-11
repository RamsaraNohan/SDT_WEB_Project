namespace BlindMatch.Application.Interfaces;

public interface IBlobStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    Task<string> GeneratePresignedUrlAsync(string blobUrl, int expiryMinutes = 60);
    Task DeleteFileAsync(string blobUrl);
}
