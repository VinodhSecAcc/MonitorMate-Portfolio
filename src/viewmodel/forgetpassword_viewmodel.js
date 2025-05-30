import { AuthService } from "@/service/auth_service";

export class ForgetPasswordViewModel {
  constructor() {
    this.isLoading = false;
    this.errorMessage = "";
    this.successMessage = "";
    this.email = "";
    
    // Observers for UI updates
    this.observers = [];
  }

  // Observer pattern for UI updates
  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notifyObservers() {
    this.observers.forEach(observer => observer.update());
  }

  // Getters for UI state
  getIsLoading() {
    return this.isLoading;
  }

  getErrorMessage() {
    return this.errorMessage;
  }

  getSuccessMessage() {
    return this.successMessage;
  }

  getEmail() {
    return this.email;
  }

  // Setters with notification
  setEmail(email) {
    this.email = email;
    this.clearMessages(); // Clear previous messages when email changes
    this.notifyObservers();
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.notifyObservers();
  }

  setErrorMessage(message) {
    this.errorMessage = message;
    this.successMessage = ""; // Clear success message when error occurs
    this.notifyObservers();
  }

  setSuccessMessage(message) {
    this.successMessage = message;
    this.errorMessage = ""; // Clear error message when success occurs
    this.notifyObservers();
  }

  clearMessages() {
    this.errorMessage = "";
    this.successMessage = "";
    this.notifyObservers();
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Main forget password function
  async sendPasswordReset(email = null) {
    try {
      // Use provided email or instance email
      const emailToReset = email || this.email;

      // Clear previous messages
      this.clearMessages();

      // Validate email
      if (!emailToReset || !emailToReset.trim()) {
        this.setErrorMessage("Please enter your email address.");
        return { success: false, error: "Email is required" };
      }

      if (!this.isValidEmail(emailToReset)) {
        this.setErrorMessage("Please enter a valid email address.");
        return { success: false, error: "Invalid email format" };
      }

      // Set loading state
      this.setLoading(true);

      console.log("🔄 ForgetPasswordViewModel: Initiating password reset for:", emailToReset);

      // Call AuthService
      const result = await AuthService.forgetPassword(emailToReset);

      if (result.success) {
        this.setSuccessMessage(result.message);
        console.log("✅ ForgetPasswordViewModel: Password reset email sent successfully");
        
        // Optionally clear email after successful send
        // this.setEmail("");
        
        return { success: true, message: result.message };
      } else {
        this.setErrorMessage(result.error);
        console.error("❌ ForgetPasswordViewModel: Failed to send password reset email:", result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      this.setErrorMessage(errorMessage);
      console.error("❌ ForgetPasswordViewModel: Unexpected error:", error);
      return { success: false, error: errorMessage };
    } finally {
      this.setLoading(false);
    }
  }

  // Helper method to reset the form
  resetForm() {
    this.email = "";
    this.clearMessages();
    this.setLoading(false);
  }

  // Helper method to check if form is ready for submission
  canSubmit() {
    return !this.isLoading && this.email.trim() && this.isValidEmail(this.email);
  }

  // Helper method for UI to get current state
  getState() {
    return {
      email: this.email,
      isLoading: this.isLoading,
      errorMessage: this.errorMessage,
      successMessage: this.successMessage,
      canSubmit: this.canSubmit()
    };
  }

  // Method to handle form submission with validation
  async handleFormSubmit(formData) {
    const email = formData.email || formData.get?.('email') || this.email;
    
    if (email !== this.email) {
      this.setEmail(email);
    }
    
    return await this.sendPasswordReset(email);
  }

  // Static method to create instance (useful for dependency injection)
  static create() {
    return new ForgetPasswordViewModel();
  }
}