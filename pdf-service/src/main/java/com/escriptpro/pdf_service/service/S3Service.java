package com.escriptpro.pdf_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;

import java.io.InputStream;
import java.net.URI;
import java.time.Duration;

@Slf4j
@Service
public class S3Service {

    public enum FileType {
        LOGO(null),              // Public - no presigned URL
        SIGNATURE(Duration.ofMinutes(10)),
        PRESCRIPTION_PDF(Duration.ofMinutes(5)),
        XRAY(Duration.ofMinutes(5));

        private final Duration expiry;

        FileType(Duration expiry) {
            this.expiry = expiry;
        }

        public Duration getExpiry() {
            return expiry;
        }

        public boolean isPublic() {
            return expiry == null;
        }
    }

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucketName;
    private final String endpoint;

    public S3Service(
            @Value("${app.s3.endpoint}") String endpoint,
            @Value("${app.s3.bucket-name}") String bucketName,
            @Value("${app.s3.access-key-id}") String accessKeyId,
            @Value("${app.s3.secret-access-key}") String secretAccessKey,
            @Value("${app.s3.region}") String region) {

        this.endpoint = endpoint;
        this.bucketName = bucketName;

        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        S3Configuration serviceConfiguration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();

        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .endpointOverride(URI.create(endpoint))
                .serviceConfiguration(serviceConfiguration)
                .build();

        this.s3Presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .endpointOverride(URI.create(endpoint))
                .serviceConfiguration(serviceConfiguration)
                .build();
    }

    /**
     * Upload a file to S3 - returns the S3 key (not URL)
     */
    public String uploadFile(String key, InputStream inputStream, long contentLength, String contentType) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .contentLength(contentLength)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(inputStream, contentLength));
            log.info("File uploaded successfully to S3: {}", key);
            return key;  // Return only the key
        } catch (Exception e) {
            log.error("Failed to upload file: {}", key, e);
            throw new RuntimeException("Failed to upload file to S3: " + e.getMessage(), e);
        }
    }

    /**
     * Generate URL for accessing a file based on its type
     */
    public String generateUrl(String key, FileType fileType) {
        if (fileType.isPublic()) {
            // For public files like logos, return direct S3 URL
            return String.format("%s/%s/%s", endpoint, bucketName, key);
        }
        // For protected files, generate presigned URL
        return generatePresignedUrl(key, fileType.getExpiry());
    }

    /**
     * Generate a presigned URL with specific duration
     */
    private String generatePresignedUrl(String key, Duration duration) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(duration)
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for key: {}", key, e);
            throw new RuntimeException("Failed to generate presigned URL: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a file from S3
     */
    public void deleteFile(String key) {
        try {
            s3Client.deleteObject(builder -> builder.bucket(bucketName).key(key));
            log.info("File deleted successfully: {}", key);
        } catch (Exception e) {
            log.error("Failed to delete file: {}", key, e);
            throw new RuntimeException("Failed to delete file from S3: " + e.getMessage(), e);
        }
    }

    public void close() {
        if (s3Client != null) {
            s3Client.close();
        }
        if (s3Presigner != null) {
            s3Presigner.close();
        }
    }
}
