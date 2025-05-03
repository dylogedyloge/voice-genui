/**
 * Formats a JavaScript Date object or timestamp into a Persian time format.
 * Example output: 3:45 بعدازظهر
 * 
 * @param dateInput - The JavaScript Date object, timestamp, or date string to format
 * @returns A string representing the time in Persian format
 */
export const formatPersianTime = (dateInput?: Date | string | number): string => {
    try {
      // Check for undefined or invalid dateInput
      if (!dateInput) {
        return "";
      }
  
      // Convert input to Date object, regardless of whether it's a string, number, or Date
      const date = typeof dateInput === 'string' || typeof dateInput === 'number'
        ? new Date(dateInput)
        : dateInput;
  
      // Ensure the Date object is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid Date:", dateInput);
        return "";
      }
  
      // Extract hours and minutes
      const hours = date.getHours();
      const minutes = date.getMinutes();
  
      // Determine AM or PM in Persian
      const period = hours >= 12 ? "بعدازظهر" : "صبح";
  
      // Convert to 12-hour format and pad minutes with leading zero
      const persianHours = hours % 12 || 12;
      const paddedMinutes = minutes.toString().padStart(2, "0");
  
      // Return formatted time
      return `${persianHours}:${paddedMinutes} ${period}`;
    } catch (error) {
      console.error('Error formatting Persian time:', error);
      return "";
    }
  };
  
  /**
   * Converts a Date object to a Persian date string (year/month/day).
   * Example output: 1401/6/10
   * 
   * @param dateInput - The JavaScript Date object, timestamp, or date string to format
   * @returns A string representing the date in Persian format
   */
  export const formatPersianDate = (dateInput?: Date | string | number): string => {
    try {
      // Handle undefined or null
      if (!dateInput) {
        return "";
      }
  
      // Convert input to Date object
      const date = new Date(dateInput);
  
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid Date:", dateInput);
        return "";
      }
  
      const persianDate = new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(date);
  
      return persianDate;
    } catch (error) {
      console.error("Error formatting Persian date:", error);
      return "";
    }
  };
  
  /**
   * Checks if the input is a valid date
   * 
   * @param date - The value to check
   * @returns boolean indicating if the input is a valid date
   */
  export const isValidDate = (date: any): boolean => {
    if (!date) return false;
    const d = new Date(date);
    return !isNaN(d.getTime());
  };