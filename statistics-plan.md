# Statistics Simulation Suite Plan, Revalidated

## Validation Basis
- Cross-check the scope against [Practical Statistics for Data Scientists, 2e](https://www.oreilly.com/library/view/practical-statistics-for/9781492072935/), [OpenIntro Statistics](https://www.openintro.org/book/os/), the [StatQuest video index](https://statquest.org/video_index.html), and the [NIST/SEMATECH e-Handbook](https://www.nist.gov/publications/handbook-151-nistsematech-e-handbook-statistical-methods).
- The earlier plan was missing three important foundations those sources consistently include: data collection and bias, probability with binomial/Bernoulli ideas, and a light regression/classification bridge.
- With the revisions below, the suite covers most important introductory and practical statistics topics. It is not exhaustive; advanced Bayesian, time series, survival-only workflows, and multivariate methods remain out of scope for v1.

## Summary
- Add a new `statistics` category with `9` compact JSX simulations in `sims/statistics/`.
- Keep each file around `250-450` lines, maximum `5` tabs. If a sim exceeds about `500` lines, split it.
- Every tab must deliver all three layers:
  `Practical insight` with a real use case,
  `Intuition` with one interactive visual,
  `Theory` with only the minimum formula/definition needed.
- Use original prompts inspired by StatQuest and the books’ topic flow; do not copy their wording.

## Simulation Set
- `data-collection-and-types.jsx`
  Tabs: `Types of Data`, `Population vs Sample`, `Sampling Methods`, `Bias + Confounding`, `Observational vs Experiment`.
- `descriptive-stats-and-visuals.jsx`
  Tabs: `Mean / Median / Mode`, `Spread + Robustness`, `Percentiles + Boxplots`, `Histograms + Shape`, `Categorical Summaries`.
- `probability-and-binomial.jsx`
  Tabs: `Probability Rules`, `Conditional Probability`, `Expected Value`, `Bernoulli + Binomial`, `Bayes in Screening`.
- `common-distributions.jsx`
  Tabs: `Gaussian + t`, `Poisson`, `Exponential`, `Weibull`, `Compare When to Use`.
- `sampling-distributions-and-clt.jsx`
  Tabs: `Repeated Sampling`, `Sample Mean`, `Sample Proportion`, `CLT`, `Standard Error`.
- `estimation-and-confidence-intervals.jsx`
  Tabs: `Point Estimates`, `Confidence Intervals`, `Margin of Error`, `Bootstrap`, `Sample Size`.
- `hypothesis-testing-core.jsx`
  Tabs: `Null vs Alternative`, `Test Statistic`, `P-Value`, `Type I/II + Power`, `Multiple Testing + p-Hacking`.
- `tests-for-groups-and-categories.jsx`
  Tabs: `t-Tests`, `Paired vs Independent`, `Proportion Tests`, `Chi-Square + Fisher`, `ANOVA + Effect Size`.
- `association-and-regression.jsx`
  Tabs: `Covariance + Correlation`, `Simple Linear Regression`, `Residuals + Diagnostics`, `Multiple Regression Overview`, `Logistic Regression Overview`.

## Important Interface and Content Rules
- Add a `statistics` icon mapping in [Home.jsx](/Users/praveenchand/Documents/Python%20experiments/simulations/src/components/Home.jsx). No routing or loader changes are needed.
- Stay dependency-light per [package.json](/Users/praveenchand/Documents/Python%20experiments/simulations/package.json): React, `framer-motion`, `lucide-react`, inline SVG/canvas only.
- Each tab should answer one practical question, for example:
  `Is this variable numerical or categorical, and what summary is valid?`
  `Should I use Poisson or Gaussian here?`
  `Why does the sampling distribution become more normal as n grows?`
  `When is a p-value small but the effect not practically important?`
- Use small generated or hardcoded datasets only: survey categories, test scores, A/B conversions, defect counts, waiting times, component lifetimes, bivariate scatter samples.
- For distributions, anchor the intuition in realistic use cases:
  Gaussian for measurement noise,
  Binomial for conversion counts,
  Poisson for arrivals or defects,
  Exponential for waiting time,
  Weibull for failure/lifetime behavior.
- Each tab should include one “common mistake” note so the simulations teach judgment, not just formulas.

## Test Plan
- `npm run build` passes with all new `sims/statistics/*.jsx` files.
- The Statistics category appears and each sim opens correctly through the current hash-router flow.
- Invalid summaries are not presented as appropriate for the wrong data type.
- Distribution tabs respond correctly to parameter changes and keep discrete versus continuous visuals distinct.
- Sampling tabs show convergence and reduced spread as sample size increases.
- CI tabs narrow and widen in the expected direction as `n`, variance, and confidence level change.
- Hypothesis tabs show the expected changes in p-value, power, and error tradeoffs.
- Test-selection tabs map data type plus question type to a sensible method.
- Mobile and desktop layouts remain usable with no broken controls or overflow.

## Assumptions
- `CMT` means `CLT`.
- “Practical insights, theory, intuition” means each tab should teach usage, mechanism, and interpretation together, not as separate long theory pages.
- This revised plan is intended to cover most core introductory and practical statistics topics from standard texts; deeper topics such as nonparametrics, survival analysis in depth, Bayesian inference, time series, and PCA/classification beyond logistic regression can be a later phase.
