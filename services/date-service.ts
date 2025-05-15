import moment from "moment-jalaali";

class DateService {
  private static instance: DateService;

  private constructor() {
    // Initialize moment-jalaali
    moment.loadPersian({ usePersianDigits: true });
  }

  public static getInstance(): DateService {
    if (!DateService.instance) {
      DateService.instance = new DateService();
    }
    return DateService.instance;
  }

  // Convert Gregorian to Jalali
  public toJalali(date: Date | string): string {
    return moment(date).format("jYYYY/jMM/jDD");
  }

  // Convert Jalali to Gregorian
  public toGregorian(jalaliDate: string): string {
    return moment(jalaliDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD");
  }

  // Get today's date in both formats
  public getToday(): { gregorian: string; jalali: string } {
    const today = new Date();
    return {
      gregorian: today.toISOString().split("T")[0],
      jalali: this.toJalali(today),
    };
  }

  // Get tomorrow's date in both formats
  // public getTomorrow(): { gregorian: string; jalali: string } {
  //   const today = new Date();
  //   const tomorrow = new Date(today);
  //   tomorrow.setDate(today.getDate() + 1);
  //   return {
  //     gregorian: tomorrow.toISOString().split("T")[0],
  //     jalali: this.toJalali(tomorrow),
  //   };
  // }
  public getTomorrow(): { gregorian: string; jalali: string } {
    const today = moment();
    const tomorrow = today.clone().add(1, 'days');
    
    return {
      gregorian: tomorrow.format('YYYY-MM-DD'),
      jalali: tomorrow.format('jYYYY/jMM/jDD'),
    };
  }

  // Format a date with custom format
  public format(date: Date | string, format: string): string {
    return moment(date).format(format);
  }

  // Add days to a date
  public addDays(date: Date | string, days: number): Date {
    return moment(date).add(days, "days").toDate();
  }

  // Compare two dates
  public isAfter(date1: Date | string, date2: Date | string): boolean {
    return moment(date1).isAfter(date2);
  }
}

export default DateService.getInstance();
