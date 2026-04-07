package com.escriptpro.authservice.mfa;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.mfa")
public class MfaProperties {

    private boolean enabled;
    private String provider = "noop";
    private String defaultRegion = "IN";
    private String twilioAccountSid;
    private String twilioAuthToken;
    private String twilioFromNumber;
    private String twilioVerifyServiceSid;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getDefaultRegion() {
        return defaultRegion;
    }

    public void setDefaultRegion(String defaultRegion) {
        this.defaultRegion = defaultRegion;
    }

    public String getTwilioAccountSid() {
        return twilioAccountSid;
    }

    public void setTwilioAccountSid(String twilioAccountSid) {
        this.twilioAccountSid = twilioAccountSid;
    }

    public String getTwilioAuthToken() {
        return twilioAuthToken;
    }

    public void setTwilioAuthToken(String twilioAuthToken) {
        this.twilioAuthToken = twilioAuthToken;
    }

    public String getTwilioFromNumber() {
        return twilioFromNumber;
    }

    public void setTwilioFromNumber(String twilioFromNumber) {
        this.twilioFromNumber = twilioFromNumber;
    }

    public String getTwilioVerifyServiceSid() {
        return twilioVerifyServiceSid;
    }

    public void setTwilioVerifyServiceSid(String twilioVerifyServiceSid) {
        this.twilioVerifyServiceSid = twilioVerifyServiceSid;
    }
}
