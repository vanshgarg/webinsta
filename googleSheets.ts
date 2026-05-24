// src/services/googleSheets.ts

export interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string;
  business?: string;
  businessType: string;
  message?: string;
  submittedAt: string;
  synced?: boolean;
}

const DEFAULT_SPREADSHEET_ID = '1OP_-L7qfANxSeE3MmP6CmR8WZ-8onBe3TEw0F1YMeOE';

/**
 * Clean helper to clear invalid token from localStorage safely
 */
function handleAuthExpired() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('devduo_google_token');
  }
}

/**
 * Dynamically queries the spreadsheet metadata to find the exact name of the first tab (sheet).
 * Defensively falls back to "Sheet 1", then "Sheet1".
 */
export async function getTargetSheetName(accessToken: string, spreadsheetId: string = DEFAULT_SPREADSHEET_ID): Promise<string> {
  const cleanId = spreadsheetId || DEFAULT_SPREADSHEET_ID;
  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      handleAuthExpired();
      throw new Error("Your Google session has expired. Please sign in again.");
    }

    if (response.ok) {
      const data = await response.json();
      if (data.sheets && data.sheets.length > 0) {
        const titles: string[] = data.sheets.map((s: any) => s.properties?.title || "");
        
        // 1. Try to find "Sheet 1" (case insensitive, exact match)
        let found = titles.find(t => t.trim().toLowerCase() === 'sheet 1');
        if (found) return found;

        // 2. Try to find "Sheet1" (case insensitive, exact match)
        found = titles.find(t => t.trim().toLowerCase() === 'sheet1');
        if (found) return found;

        // 3. Try to find any sheet containing "sheet 1" or "sheet1"
        found = titles.find(t => {
          const lower = t.toLowerCase();
          return lower.includes('sheet 1') || lower.includes('sheet1');
        });
        if (found) return found;

        // 4. Default to first sheet
        const firstSheet = data.sheets[0].properties?.title;
        if (firstSheet) return firstSheet;
      }
    } else {
      const errMsg = await response.text();
      console.warn(`Spreadsheet metadata fetch returned status ${response.status}:`, errMsg);
    }
  } catch (err: any) {
    if (err.message && err.message.includes('session has expired')) {
      throw err;
    }
    console.error('Error fetching sheet list from Google API:', err);
  }

  // Fallback to "Sheet 1" (from user's screenshot) or default "Sheet1"
  return 'Sheet 1';
}

/**
 * Initializes the header row if the sheet is fresh
 */
export async function initializeHeaders(accessToken: string, spreadsheetId: string = DEFAULT_SPREADSHEET_ID): Promise<boolean> {
  const cleanId = spreadsheetId || DEFAULT_SPREADSHEET_ID;
  const headers = [
    'Submitted At',
    'Lead Name',
    'Email Address',
    'Phone / WhatsApp',
    'Business Name',
    'Business Type',
    'Additional Message / Plan'
  ];

  try {
    const sheetName = await getTargetSheetName(accessToken, cleanId);
    // Explicitly enclose the sheet name in single quotes so that spaces/special characters do not cause syntax errors.
    const range = encodeURIComponent(`'${sheetName}'!A1`);

    console.log(`Initializing headers for sheet: "${sheetName}" using range: "${range}" in spreadsheet: "${cleanId}"`);

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `'${sheetName}'!A1`,
          majorDimension: 'ROWS',
          values: [headers],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        handleAuthExpired();
        throw new Error("Your Google session has expired. Please sign in again.");
      }
      const errorText = await response.text();
      console.error('Failed to initialize headers:', errorText);
      throw new Error(`Google Sheets API Error: ${response.status} - ${errorText}`);
    }
    return response.ok;
  } catch (err: any) {
    if (err.message && err.message.includes('session has expired')) {
      throw err;
    }
    console.error('Error initializing headers in Google Sheets:', err);
    throw err;
  }
}

/**
 * Checks if the target sheet already has headers (e.g. A1 contains anything).
 * If not, it writes the headers first.
 */
export async function ensureHeadersExist(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string
): Promise<void> {
  const cleanId = spreadsheetId || DEFAULT_SPREADSHEET_ID;
  const range = encodeURIComponent(`'${sheetName}'!A1:B1`);
  
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    if (response.status === 401) {
      handleAuthExpired();
      throw new Error("Your Google session has expired. Please sign in again.");
    }

    let hasHeaders = false;
    if (response.ok) {
      const data = await response.json();
      if (data.values && data.values.length > 0 && data.values[0].length > 0) {
        const firstCell = data.values[0][0];
        if (firstCell && String(firstCell).trim().length > 0) {
          hasHeaders = true;
          console.log('Headers verified, skipping initialization:', data.values[0]);
        }
      }
    }
    
    if (!hasHeaders) {
      console.log('No headers found. Automatically initializing sheet headers first...');
      await initializeHeaders(accessToken, cleanId);
    }
  } catch (err: any) {
    if (err.message && err.message.includes('session has expired')) {
      throw err;
    }
    console.error('Error ensuring headers exist. Writing headers automatically as a fallback...', err);
    try {
      await initializeHeaders(accessToken, cleanId);
    } catch (_) {
      // Ignore inner failure as it will propagate downstream on append if real
    }
  }
}

/**
 * Appends form submission details to the sheet rows
 */
export async function appendLeadsToSheet(
  accessToken: string, 
  rowValues: any[], 
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<boolean> {
  const cleanId = spreadsheetId || DEFAULT_SPREADSHEET_ID;
  try {
    const sheetName = await getTargetSheetName(accessToken, cleanId);
    
    // Automatically ensure the spreadsheet has the correct header row
    await ensureHeadersExist(accessToken, cleanId, sheetName);

    // Explicitly enclose the sheet name in single quotes so that spaces/special characters do not cause syntax errors.
    const range = encodeURIComponent(`'${sheetName}'!A1`);

    console.log(`Appending lead to sheet: "${sheetName}" using range: "${range}" in spreadsheet: "${cleanId}"`);

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `'${sheetName}'!A1`,
          majorDimension: 'ROWS',
          values: [rowValues],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        handleAuthExpired();
        throw new Error("Your Google session has expired. Please sign in again.");
      }
      const errorText = await response.text();
      console.error('Failed to append lead:', errorText);
      throw new Error(`Google Sheets API Error: ${response.status} - ${errorText}`);
    }
    return response.ok;
  } catch (err: any) {
    if (err.message && err.message.includes('session has expired')) {
      // Avoid raw scary error reporting for predictable auth lapses
      console.warn('Google Sheets operation paused because Google session has expired.');
    } else {
      console.error('Error appending data to Google Sheets:', err);
    }
    throw err;
  }
}
