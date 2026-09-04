### Engineering & Development Rules for Anti-Gravity IDE

1. **API Security, Credential Isolation & Privacy Protection (TOP PRIORITY):**
   - Perform all physics processing, dynamic plotting, matrix math, and report generation entirely client-side; DO NOT make external API calls or send user lab data to third-party endpoints.
   - NEVER hardcode, request, prompt for, display, or leak API keys, secret tokens, environment variables, server credentials, or database connection strings anywhere in the codebase or user UI.
   - Keep all data storage entirely local to the user's browser session (`localStorage` / `sessionStorage`) without transmitting any data externally.

2. **Strict Units & Dimensional Consistency Rule:**
   - Always convert user inputs into standard SI units (meters, kilograms, seconds, amperes, kelvin) inside the calculation engine BEFORE executing mathematical formulas or regression.
   - Display raw user inputs in their selected units in the table, but explicitly label calculated output columns with their SI units.

3. **Precision & Floating-Point Protection:**
   - Use exponential notation (e.g., 1.602e-19) for physical constants ($e, h, m_e, \epsilon_0, c$).
   - Round final computed values to 4 significant figures or user-defined precision to avoid JavaScript floating-point artifacts (e.g., 6.626000000000001e-34).

4. **Regression Safety & Edge Case Handling:**
   - Require a minimum of 3 valid data rows before computing linear regression ($y = mx + c$) or plotting the best-fit line.
   - Ignore empty, non-numeric, or incomplete rows during calculation rather than breaking the application or returning `NaN`.
   - Prevent divide-by-zero errors (e.g., when wavelength $\lambda = 0$ or temperature $T = 0 \text{ K}$) by displaying clear field validation warnings.

5. **Zero-Latency Reactive State Management:**
   - Calculations and graph re-renders must trigger instantly via reactive state hooks as the user edits table cells—without requiring manual page refreshes.

6. **Self-Contained Data Persistence:**
   - Save user inputs, added rows, and selected experiment tabs to `localStorage` so data is not lost if the browser tab reloads.
   - Include a one-click "Reset to Factory Sample Data" button on every experiment screen to restore defaults.

7. **Defensive Plotting & Scale Rules:**
   - Auto-scale graph axes based on the min/max values of the active dataset while keeping zero baselines where physically relevant (e.g., $I\text{-}V$ curves).
   - Use distinct visual markers (dots/crosses) for raw experimental data points and a solid contrasting line for the calculated line of best fit.

8. **Error Analysis Transparency:**
   - For every experiment, compare calculated values against standard accepted scientific constants and explicitly output the percentage error:
     $$\text{Error (\%)} = \left| \frac{\text{Experimental} - \text{Accepted}}{\text{Accepted}} \right| \times 100$$
   - Display the Coefficient of Determination ($R^2$) on every linear regression plot so users can evaluate line quality.

9. **Export-Ready Output:**
   - Generated CSVs and PDF lab reports must include: Experiment Title, Timestamp, Raw Data Table, Calculated Results Summary, $R^2$ Score, and the Graph image.

10. **Modular Architecture:**
    - Store all physical constants in a dedicated central configuration file (`constants.js` or `constants.ts`) so they can be modified globally if needed.
    - Keep each experiment's mathematical logic separated into pure functions independent of UI rendering components.

11. **Clean Modern UI & Mobile Accessibility:**
    - Use clean monospace fonts for data tables and mathematical results to maintain alignment.
    - Ensure data tables are scrollable horizontally on smaller screens without breaking page navigation.