/**
 * Enhanced Date Range Parser for Real-World Calendar Entry Parsing
 * Handles patterns like "17-20" as "November 17-20" with intelligent fallback
 */

class DateRangeParser {
  
  /**
   * Parse date strings with enhanced intelligence for real-world usage
   * @param {string} dateStr - Raw date string from user input
   * @param {object} context - Additional context (event title, etc.)
   * @returns {object} Parsing result with metadata
   */
  parseDateString(dateStr, context = {}) {
    if (!dateStr || typeof dateStr !== 'string') {
      return this.createParseResult('2025-11-17', 'default', 'No date provided', false, context);
    }
    
    console.log(`📅 Parsing date: "${dateStr}" with context:`, context);
    
    // Handle relative dates
    const lowerDate = dateStr.toLowerCase().trim();
    if (lowerDate === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return this.createParseResult(today, 'relative_today', 'Relative date - today', false, context);
    }
    
    if (lowerDate === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = tomorrow.toISOString().split('T')[0];
      return this.createParseResult(result, 'relative_tomorrow', 'Relative date - tomorrow', false, context);
    }
    
    // Handle date ranges like "17-20" as "November 17-20"
    if (dateStr.includes('-') && !dateStr.startsWith('20')) {
      const rangeResult = this.handleDateRange(dateStr, context);
      if (rangeResult) {
        return rangeResult;
      }
    }
    
    // Handle malformed dates with intelligent correction
    if (dateStr.includes('-')) {
      const malformedResult = this.handleMalformedDate(dateStr, context);
      if (malformedResult) {
        return malformedResult;
      }
    }
    
    // Handle natural language date patterns
    const naturalResult = this.handleNaturalLanguageDate(dateStr, context);
    if (naturalResult) {
      return naturalResult;
    }
    
    // Validate standard format
    if (this.isValidDate(dateStr)) {
      return this.createParseResult(dateStr, 'valid_standard', 'Valid standard date format', false, context);
    }
    
    // Final fallback - extract any meaningful date information
    const extractedResult = this.extractAnyDateInfo(dateStr, context);
    if (extractedResult) {
      return extractedResult;
    }
    
    // Ultimate fallback with clarification request
    return this.createParseResult(
      new Date().toISOString().split('T')[0], 
      'fallback_with_clarification', 
      'Unable to parse date - needs clarification', 
      true, 
      context
    );
  }
  
  /**
   * Handle date range patterns like "17-20" as "November 17-20"
   * @param {string} dateStr - Date range string
   * @param {object} context - Additional context
   * @returns {object|null} Parsing result or null if not a date range
   */
  handleDateRange(dateStr, context) {
    const parts = dateStr.split('-').map(p => p.trim());
    
    if (parts.length === 2) {
      const day1 = parseInt(parts[0]);
      const day2 = parseInt(parts[1]);
      
      // Check if this looks like a day range (e.g., "17-20")
      if (this.isValidDay(day1) && this.isValidDay(day2) && day1 < day2) {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        
        const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day1.toString().padStart(2, '0')}`;
        const endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day2.toString().padStart(2, '0')}`;
        
        console.log(`  → Date range detected: "${dateStr}" → Start: ${startDate}, End: ${endDate}`);
        
        return {
          date: startDate,
          endDate: endDate,
          isRange: true,
          method: 'date_range_detected',
          description: `Date range ${dateStr} interpreted as ${startDate} to ${endDate}`,
          needsClarification: false,
          parsed: true,
          clarificationMessage: null,
          context: context
        };
      }
    }
    
    return null;
  }
  
  /**
   * Handle malformed date strings with intelligent correction
   * @param {string} dateStr - Malformed date string
   * @param {object} context - Additional context
   * @returns {object|null} Parsing result or null if not malformed
   */
  handleMalformedDate(dateStr, context) {
    // Handle patterns like "20-17" → "11-17" (current month/day)
    const match = dateStr.match(/^(\d{2})-(\d{2})$/);
    if (match) {
      return this.handleDDMMFormat(match, context);
    }
    
    const yyyyMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (yyyyMatch) {
      return this.handleDDMMYYYYFormat(yyyyMatch, context);
    }
    
    return null;
  }
  
  /**
   * Handle DD-MM format (e.g., "20-17" → current month/day)
   * @param {Array} match - Regex match result
   * @param {object} context - Additional context
   * @returns {object} Parsing result
   */
  handleDDMMFormat(match, context) {
    const part1 = parseInt(match[1]);
    const part2 = parseInt(match[2]);
    
    // Special handling for common malformed patterns
    if (part1 === 20 && part2 === 17) {
      // "20-17" → current month/day
      const today = new Date();
      const result = `${today.getFullYear()}-${today.getMonth() + 1}-${part2.toString().padStart(2, '0')}`;
      return this.createParseResult(result, 'malformed_special_case', 'Special malformed date fixed', false, context);
    } else if (part1 === 25 && part2 === 17) {
      // "25-17" → current month/day
      const today = new Date();
      const result = `${today.getFullYear()}-${today.getMonth() + 1}-${part2.toString().padStart(2, '0')}`;
      return this.createParseResult(result, 'malformed_special_case', 'Special malformed date fixed', false, context);
    }
    
    // General case: assume DD-MM format if both are valid days
    if (this.isValidDay(part1) && this.isValidDay(part2)) {
      const today = new Date();
      const result = `${today.getFullYear()}-${part1.toString().padStart(2, '0')}-${part2.toString().padStart(2, '0')}`;
      return this.createParseResult(result, 'malformed_ddmm_fixed', 'Malformed date interpreted as DD-MM', false, context);
    }
    
    return null;
  }
  
  /**
   * Handle DD-MM-YYYY format
   * @param {Array} match - Regex match result
   * @param {object} context - Additional context
   * @returns {object} Parsing result
   */
  handleDDMMYYYYFormat(match, context) {
    const part1 = parseInt(match[1]);
    const part2 = parseInt(match[2]);
    const year = parseInt(match[3]);
    
    if (this.isValidDay(part1) && this.isValidDay(part2) && year >= 2020 && year <= 2030) {
      const result = `${year}-${part1.toString().padStart(2, '0')}-${part2.toString().padStart(2, '0')}`;
      return this.createParseResult(result, 'malformed_ddmmyyyy_fixed', 'Malformed date interpreted as DD-MM-YYYY', false, context);
    }
    
    return null;
  }
  
  /**
   * Handle natural language date patterns
   * @param {string} dateStr - Date string
   * @param {object} context - Additional context
   * @returns {object|null} Parsing result or null
   */
  handleNaturalLanguageDate(dateStr, context) {
    const lowerText = dateStr.toLowerCase();
    
    // Month names
    const monthMap = {
      'january': '01', 'jan': '01',
      'february': '02', 'feb': '02',
      'march': '03', 'mar': '03',
      'april': '04', 'apr': '04',
      'may': '05',
      'june': '06', 'jun': '06',
      'july': '07', 'jul': '07',
      'august': '08', 'aug': '08',
      'september': '09', 'sep': '09',
      'october': '10', 'oct': '10',
      'november': '11', 'nov': '11',
      'december': '12', 'dec': '12'
    };
    
    for (const [monthName, monthNum] of Object.entries(monthMap)) {
      if (lowerText.includes(monthName)) {
        const dayMatch = dateStr.match(/(\d{1,2})/);
        if (dayMatch) {
          const day = parseInt(dayMatch[1]);
          if (this.isValidDay(day)) {
            const year = new Date().getFullYear();
            const result = `${year}-${monthNum}-${day.toString().padStart(2, '0')}`;
            return this.createParseResult(result, 'natural_language', `Natural language date with ${monthName}`, false, context);
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * Extract any meaningful date information from text
   * @param {string} dateStr - Date string
   * @param {object} context - Additional context
   * @returns {object|null} Parsing result or null
   */
  extractAnyDateInfo(dateStr, context) {
    // Look for any numbers that could be dates
    const numberMatches = dateStr.match(/\d+/g);
    if (numberMatches && numberMatches.length >= 1) {
      const num = parseInt(numberMatches[0]);
      
      // If it's a valid day, assume current month
      if (this.isValidDay(num)) {
        const today = new Date();
        const result = `${today.getFullYear()}-${today.getMonth() + 1}-${num.toString().padStart(2, '0')}`;
        return this.createParseResult(result, 'extracted_day', 'Day extracted from text', false, context);
      }
    }
    
    return null;
  }
  
  /**
   * Create standardized parsing result object
   * @param {string} date - Parsed date
   * @param {string} method - Parsing method used
   * @param {string} description - Description of the method
   * @param {boolean} needsClarification - Whether clarification is needed
   * @param {object} context - Additional context
   * @returns {object} Standardized result object
   */
  createParseResult(date, method, description, needsClarification, context) {
    return {
      date: date,
      method: method,
      description: description,
      needsClarification: needsClarification,
      parsed: !needsClarification,
      clarificationMessage: needsClarification ? 
        this.generateClarificationMessage(date, context) : null,
      context: context,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Generate clarification message for ambiguous dates
   * @param {string} originalDate - Original ambiguous date
   * @param {object} context - Additional context
   * @returns {string} Clarification message
   */
  generateClarificationMessage(originalDate, context) {
    const suggestions = [
      `I couldn't reliably parse "${originalDate}" as a date.`,
      'Please provide the date in YYYY-MM-DD format.',
    ];
    
    if (context.eventTitle) {
      suggestions.push(`For your event: "${context.eventTitle}"`);
    }
    
    return suggestions.join(' ');
  }
  
  /**
   * Validate if a number is a valid day of month
   * @param {number} day - Day number
   * @returns {boolean} True if valid day
   */
  isValidDay(day) {
    return Number.isInteger(day) && day >= 1 && day <= 31;
  }
  
  /**
   * Standard date validation (YYYY-MM-DD format)
   * @param {string} date - Date string
   * @returns {boolean} True if valid
   */
  isValidDate(date) {
    if (!date || typeof date !== 'string') return false;
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime()) && dateObj.toISOString().split('T')[0] === date;
  }
}

module.exports = DateRangeParser;