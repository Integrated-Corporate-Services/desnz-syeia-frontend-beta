/**
 * Data Validation and GDS Compliance Test Script
 * Tests all GET, SAVE, and UPDATE operations for NWL features
 */

import { landDetailsService } from '../services/landDetailsService';
import { LandDetails } from '../types';

/**
 * Validate Land Details Data Structure
 */
export const validateLandDetailsResponse = (data: LandDetails | null): boolean => {
  if (!data) {
    console.warn('[Validation] Land details data is null');
    return false;
  }

  const requiredFields = [
    'site_address_line1',
    'site_town',
    'site_postcode',
    'site_country',
  ];

  const missingFields = requiredFields.filter(field => {
    const value = (data as any)[field];
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    console.warn('[Validation] Missing required fields:', missingFields);
    return false;
  }

  return true;
};

/**
 * Test GET operation for Land Details
 */
export const testLandDetailsGET = async (applicationId: string): Promise<boolean> => {
  console.log('[Test] Testing Land Details GET operation', { applicationId });
  
  try {
    const data = await landDetailsService.getLandDetails(applicationId);
    
    if (!data) {
      console.log('[Test] No land details found (404 expected for new applications)');
      return true;
    }

    const isValid = validateLandDetailsResponse(data);
    
    if (isValid) {
      console.log('[Test] ✅ Land Details GET successful', {
        site_address: data.site_address_line1,
        country: data.site_country,
        has_grid_reference: !!data.os_grid_reference_letter,
      });
    } else {
      console.error('[Test] ❌ Land Details validation failed');
    }

    return isValid;
  } catch (error) {
    console.error('[Test] ❌ Land Details GET error:', error);
    return false;
  }
};

/**
 * Test PATCH operation for Land Details
 */
export const testLandDetailsPATCH = async (
  applicationId: string,
  updateData: Partial<LandDetails>
): Promise<boolean> => {
  console.log('[Test] Testing Land Details PATCH operation', { applicationId, updateData });
  
  try {
    const result = await landDetailsService.updateLandDetails(applicationId, updateData);
    
    if (!result) {
      console.error('[Test] ❌ Land Details PATCH returned null');
      return false;
    }

    console.log('[Test] ✅ Land Details PATCH successful', result);
    return true;
  } catch (error) {
    console.error('[Test] ❌ Land Details PATCH error:', error);
    return false;
  }
};

/**
 * GDS Compliance Checks
 */
export const checkGDSCompliance = (data: LandDetails): {
  compliant: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  // Check postcode format (basic UK postcode validation)
  if (data.site_postcode) {
    const postcodePattern = /^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i;
    if (!postcodePattern.test(data.site_postcode.replace(/\s/g, ''))) {
      issues.push('Invalid UK postcode format');
    }
  }

  // Check email format if present
  const emailFields = ['identifying_information'];
  emailFields.forEach(field => {
    const value = (data as any)[field];
    if (value && value.includes('@')) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        issues.push(`Invalid email format in ${field}`);
      }
    }
  });

  // Check OS Grid Reference format
  if (data.os_grid_reference_letter) {
    const validLetters = ['SV', 'SW', 'SX', 'SY', 'SZ', 'TV', 'TQ', 'TR', 'SS', 'ST', 'SU', 'TL', 'TM', 'TG', 'TF', 'SP', 'SK', 'SJ', 'SO', 'NT', 'NU', 'NZ', 'NY', 'NX', 'NS', 'NG', 'NF', 'NJ', 'NK', 'NM', 'NN', 'NR', 'NB', 'NC', 'ND', 'NA', 'HT', 'HU', 'HY', 'HZ', 'HW', 'HP', 'HO'];
    if (!validLetters.includes(data.os_grid_reference_letter.toUpperCase())) {
      issues.push('Invalid OS Grid Reference letter');
    }
  }

  // Check grid reference coordinates are numeric
  if (data.os_grid_reference_easting && isNaN(Number(data.os_grid_reference_easting))) {
    issues.push('OS Grid Reference easting must be numeric');
  }
  if (data.os_grid_reference_northing && isNaN(Number(data.os_grid_reference_northing))) {
    issues.push('OS Grid Reference northing must be numeric');
  }

  return {
    compliant: issues.length === 0,
    issues,
  };
};

/**
 * Run all tests
 */
export const runAllTests = async (applicationId: string) => {
  console.log('[Test Suite] Starting comprehensive tests for application:', applicationId);
  
  const results = {
    get: false,
    patch: false,
    gdsCompliance: false,
  };

  // Test GET
  results.get = await testLandDetailsGET(applicationId);

  // Test PATCH with sample data
  const sampleUpdate: Partial<LandDetails> = {
    site_country: 'England',
    identifying_information: 'Test update',
  };
  results.patch = await testLandDetailsPATCH(applicationId, sampleUpdate);

  // Test GDS compliance
  const data = await landDetailsService.getLandDetails(applicationId);
  if (data) {
    const complianceCheck = checkGDSCompliance(data);
    results.gdsCompliance = complianceCheck.compliant;
    if (!complianceCheck.compliant) {
      console.warn('[GDS Compliance] Issues found:', complianceCheck.issues);
    } else {
      console.log('[GDS Compliance] ✅ All checks passed');
    }
  }

  console.log('[Test Suite] Results:', results);
  return results;
};
