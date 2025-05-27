/**
 * Convert dayjs/date object to UTC ISO string
 * @param dateObj - Date object from Ant Design DatePicker
 * @param isEndOfDay - Whether to set time to end of day (23:59:59.999Z) or start of day (00:00:00.000Z)
 * @returns UTC ISO string or null if conversion fails
 */
export const convertToUTCDate = (
    dateObj: any,
    isEndOfDay: boolean = false
): string | null => {
    if (!dateObj) return null;

    try {
        let date: Date;

        // Handle different types of date objects
        if (dateObj && typeof dateObj === 'object' && dateObj.$d) {
            // Dayjs object with $d property
            date = new Date(dateObj.$d);
        }
        else if (dateObj && typeof dateObj.toDate === 'function') {
            // Dayjs object with toDate method
            date = dateObj.toDate();
        }
        else if (dateObj instanceof Date) {
            // Already a Date object
            date = dateObj;
        }
        else {
            console.error("Cannot parse date object:", dateObj);
            return null;
        }

        // Extract local date components to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // Create UTC ISO string
        const utcDate = isEndOfDay
            ? `${year}-${month}-${day}T23:59:59.999Z`
            : `${year}-${month}-${day}T00:00:00.000Z`;

        return utcDate;
    } catch (error) {
        console.error("Error converting date:", error, dateObj);
        return null;
    }
};

/**
 * Process date range from Ant Design DatePicker and return [startDate, endDate] array
 * @param dateRange - Array of [startDate, endDate] from DatePicker
 * @returns Array with [startDate, endDate] in UTC ISO format, or [null, null] if invalid
 */
export const processDateRangeFilter = (dateRange: any): [string | null, string | null] => {
    if (!dateRange || !Array.isArray(dateRange)) {
        return [null, null];
    }

    const [startDate, endDate] = dateRange;

    const startISO = convertToUTCDate(startDate, false); // Start of day
    const endISO = convertToUTCDate(endDate, true);     // End of day

    return [startISO, endISO];
};

/**
 * Example usage:
 * 
 * const [startDate, endDate] = processDateRangeFilter(params.publicationDateRange);
 * // Result: ['2025-05-26T00:00:00.000Z', '2025-05-29T23:59:59.999Z']
 * 
 * // Then use in buildQuery function
 * if (startDate && endDate) {
 *   // Process with buildQuery
 * }
 */

export const MAX_UPLOAD_IMAGE_SIZE = 2; // MB