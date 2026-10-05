import Icon from "../components/Icon.jsx";

function Bars({ data, warnIdx = [], dangerIdx = [] }) {
  const max = Math.max(...data);
  const w = 560,
    h = 220,
    pad = 30;

  const bw = (w - pad * 2) / data.length - 6;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="chart-svg"
      preserveAspectRatio="none"
      style={{ width: "100%", height: "220px" }}
    >
      <g
        className="chart-grid"
        stroke="rgba(255,255,255,0.05)"
        strokeDasharray="3 3"
      >
        {[40, 90, 140, 180].map((y) => (
          <line
            key={y}
            x1={pad}
            x2={w - pad}
            y1={y}
            y2={y}
          />
        ))}
      </g>

      {data.map((v, i) => {
        const bh = (v / max) * (h - pad * 2);
        const x =
          pad +
          i * ((w - pad * 2) / data.length) +
          3;
        const y = h - pad - bh;

        const fill = dangerIdx.includes(i)
          ? "#FF4D4D"
          : warnIdx.includes(i)
          ? "#FFB300"
          : "#4EA8FF";

        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={bw}
            height={bh}
            rx="3"
            fill={fill}
            opacity="0.85"
            style={{ transition: "all 0.3s" }}
          />
        );
      })}
    </svg>
  );
}

function Donut({ segments, total }) {
  return (
    <svg width="180" height="180" viewBox="0 0 42 42">
      <circle
        cx="21"
        cy="21"
        r="15.9"
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="6"
      />

      {segments.reduce(
        (acc, s, i) => {
          const offset = acc.total;
          acc.total += s.v;

          acc.arr.push(
            <circle
              key={i}
              cx="21"
              cy="21"
              r="15.9"
              fill="none"
              stroke={s.c}
              strokeWidth="6"
              strokeDasharray={`${s.v} ${100 - s.v}`}
              strokeDashoffset={100 - offset}
              transform="rotate(-90 21 21)"
            />
          );

          return acc;
        },
        { total: 0, arr: [] }
      ).arr}

      <text
        x="21"
        y="20"
        textAnchor="middle"
        fontSize="5"
        fill="#fff"
        fontWeight="700"
      >
        {total}
      </text>

      <text
        x="21"
        y="26"
        textAnchor="middle"
        fontSize="2.6"
        fill="#5F708A"
      >
        total
      </text>
    </svg>
  );
}

export default function Analytics() {
  return (
    <div>
      {/* PAGE HEADER */}
      <div className="page-head">
        <div>
          <h1>Conjunction Analytics</h1>

          <p>
            Historical CDM screening, future-risk trends and model feature
            analysis.
          </p>
        </div>

        <div className="actions">
          <div
            className="header-search"
            style={{ maxWidth: 260, margin: 0 }}
          >
            <Icon name="search" size={14} />

            <input placeholder="Search analytics…" />
          </div>

          <button className="btn ghost">
            <Icon name="filter" size={14} />
            Filters
          </button>

          <button className="btn primary">
            <Icon name="download" size={14} />
            Export
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div
        className="grid cols-4"
        style={{ marginBottom: 20 }}
      >
        {[
          ["CDMs Screened", "38,214"],
          ["Model R²", "0.766"],
          ["MAE", "3.20"],
          ["High-Risk Recall", "77.96%"],
        ].map(([l, v]) => (
          <div
            className="card kpi hud-card"
            key={l}
          >
            <div className="k-label">
              <span>{l}</span>
            </div>

            <div className="k-value">
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* SCREENING TREND + RISK DISTRIBUTION */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1.4fr 1fr",
        }}
      >
        {/* Screening Trends */}
        <div className="card hud-card">
          <div className="card-head">
            <h3>
              Conjunction Screening Trends · 30 days
            </h3>

            <span className="chip info">
              Screening Trend
            </span>
          </div>

          <div className="chart-box">
            <Bars
              data={[
                24, 28, 22, 30, 42,
                38, 44, 50, 46, 58,
                64, 72, 66, 74, 80,
                78, 88, 84, 92, 96,
                102, 98, 110, 124, 118,
                132, 140, 128, 144, 152,
              ]}
              warnIdx={[15, 16, 17]}
              dangerIdx={[27, 29]}
            />
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="card hud-card">
          <div className="card-head">
            <h3>Risk Distribution</h3>

            <span className="chip">
              Future Risk
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: 8,
            }}
          >
            <Donut
              segments={[
                {
                  c: "#FF4D4D",
                  v: 32.27,
                },
                {
                  c: "#FFB300",
                  v: 17.17,
                },
                {
                  c: "#4EA8FF",
                  v: 50.56,
                },
              ]}
              total="100%"
            />
          </div>

          <div
            className="donut-legend"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 12,
            }}
          >
            <div
              className="lg"
              style={{
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                className="sw"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#FF4D4D",
                }}
              />

              High
            </div>

            <div
              className="lg"
              style={{
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                className="sw"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#FFB300",
                }}
              />

              Medium
            </div>

            <div
              className="lg"
              style={{
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                className="sw"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#4EA8FF",
                }}
              />

              Low
            </div>
          </div>
        </div>
      </div>

      {/* MODEL PERFORMANCE + FUTURE RISK */}
      <div
        className="grid cols-2"
        style={{ marginTop: 20 }}
      >
        {/* Model Performance */}
        <div className="card hud-card">
          <div className="card-head">
            <h3>Model Performance</h3>

            <span className="chip">
              CatBoostRegressor
            </span>
          </div>

          {[
            ["R²", 0.766, "76.6%"],
            ["MAE", 0.64, "3.20"],
            ["RMSE", 0.70, "4.78"],
            ["High-Risk Recall", 0.7796, "77.96%"],
            ["Weighted F1", 0.8606, "86.06%"],
          ].map(([name, barValue, displayValue]) => (
            <div
              className="fi-row"
              key={name}
            >
              <div className="fi-name">
                {name}
              </div>

              <div className="fi-bar">
                <span
                  style={{
                    width: `${barValue * 100}%`,
                  }}
                />
              </div>

              <div className="fi-val">
                {displayValue}
              </div>
            </div>
          ))}
        </div>

        {/* Future Risk Prediction */}
        <div className="card hud-card">
          <div className="card-head">
            <h3>
              Future Risk Prediction · +1 CDM
            </h3>

            <span className="chip">
              CatBoost
            </span>
          </div>

          <div className="chart-box">
            <svg
              viewBox="0 0 560 220"
              className="chart-svg"
              preserveAspectRatio="none"
              style={{
                width: "100%",
                height: "220px",
              }}
            >
              {/* Grid */}
              <g
                className="chart-grid"
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="3 3"
              >
                {[40, 90, 140, 180].map(
                  (y) => (
                    <line
                      key={y}
                      x1="30"
                      x2="550"
                      y1={y}
                      y2={y}
                    />
                  )
                )}
              </g>

              {/* Axes */}
              <line
                x1="30"
                y1="190"
                x2="530"
                y2="190"
                stroke="#888"
                strokeWidth="1"
              />

              <line
                x1="30"
                y1="30"
                x2="30"
                y2="190"
                stroke="#888"
                strokeWidth="1"
              />

              {/* Actual Future Risk */}
              <polyline
                fill="none"
                stroke="#4EA8FF"
                strokeWidth="3"
                points="
                  30,170
                  110,130
                  190,110
                  270,90
                  350,70
                  430,60
                  510,50
                "
              />

              {/* Predicted Future Risk */}
              <polyline
                fill="none"
                stroke="#FFB300"
                strokeWidth="3"
                strokeDasharray="8 4"
                points="
                  30,160
                  110,140
                  190,120
                  270,100
                  350,80
                  430,70
                  510,60
                "
              />

              {/* Legend */}
              <rect
                x="350"
                y="35"
                width="15"
                height="6"
                fill="#4EA8FF"
              />

              <text
                x="370"
                y="40"
                fill="#fff"
                fontSize="10"
                alignmentBaseline="middle"
              >
                Actual Future Risk
              </text>

              <rect
                x="350"
                y="55"
                width="15"
                height="6"
                fill="#FFB300"
              />

              <text
                x="370"
                y="60"
                fill="#fff"
                fontSize="10"
                alignmentBaseline="middle"
              >
                Predicted Future Risk
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
