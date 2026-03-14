import React, { useState, useEffect, useCallback, useRef } from 'react';

const ALGORITHMS = {
  bubble: 'Bubble Sort',
  selection: 'Selection Sort',
  insertion: 'Insertion Sort',
  quick: 'Quick Sort',
};

const COLORS = {
  default: '#6366f1',
  comparing: '#f59e0b',
  swapping: '#ef4444',
  sorted: '#10b981',
  pivot: '#a855f7',
};

export default function SortingVisualizer() {
  const [array, setArray] = useState([]);
  const [colorMap, setColorMap] = useState({});
  const [sorting, setSorting] = useState(false);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [arraySize, setArraySize] = useState(50);
  const [speed, setSpeed] = useState(15);
  const [comparisons, setComparisons] = useState(0);
  const stopRef = useRef(false);
  const compRef = useRef(0);

  const generateArray = useCallback(() => {
    if (sorting) return;
    const arr = Array.from(
      { length: arraySize },
      () => Math.random() * 0.85 + 0.1
    );
    setArray(arr);
    setColorMap({});
    setComparisons(0);
    compRef.current = 0;
  }, [arraySize, sorting]);

  useEffect(() => {
    generateArray();
  }, [generateArray]);

  const wait = useCallback(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (stopRef.current) reject(new Error('stopped'));
          else resolve();
        }, speed);
      }),
    [speed]
  );

  const updateState = useCallback((arr, colors) => {
    setArray([...arr]);
    setColorMap(colors);
  }, []);

  const incComp = useCallback(() => {
    compRef.current++;
    setComparisons(compRef.current);
  }, []);

  const bubbleSort = useCallback(
    async (arr) => {
      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          incComp();
          updateState(arr, { [j]: 'comparing', [j + 1]: 'comparing' });
          await wait();
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            updateState(arr, { [j]: 'swapping', [j + 1]: 'swapping' });
            await wait();
          }
        }
      }
    },
    [wait, updateState, incComp]
  );

  const selectionSort = useCallback(
    async (arr) => {
      for (let i = 0; i < arr.length - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length; j++) {
          incComp();
          updateState(arr, {
            [i]: 'swapping',
            [minIdx]: 'pivot',
            [j]: 'comparing',
          });
          await wait();
          if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx !== i) {
          [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
          updateState(arr, { [i]: 'swapping', [minIdx]: 'swapping' });
          await wait();
        }
      }
    },
    [wait, updateState, incComp]
  );

  const insertionSort = useCallback(
    async (arr) => {
      for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        updateState(arr, { [i]: 'pivot' });
        await wait();
        while (j >= 0 && arr[j] > key) {
          incComp();
          arr[j + 1] = arr[j];
          updateState(arr, { [j]: 'swapping', [j + 1]: 'swapping' });
          await wait();
          j--;
        }
        arr[j + 1] = key;
        updateState(arr, { [j + 1]: 'sorted' });
        await wait();
      }
    },
    [wait, updateState, incComp]
  );

  const quickSort = useCallback(
    async (arr, low = 0, high = arr.length - 1) => {
      if (low >= high) return;
      const pivot = arr[high];
      let i = low;
      for (let j = low; j < high; j++) {
        incComp();
        updateState(arr, {
          [j]: 'comparing',
          [high]: 'pivot',
          [i]: 'swapping',
        });
        await wait();
        if (arr[j] < pivot) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          updateState(arr, { [i]: 'swapping', [j]: 'swapping', [high]: 'pivot' });
          await wait();
          i++;
        }
      }
      [arr[i], arr[high]] = [arr[high], arr[i]];
      updateState(arr, { [i]: 'sorted' });
      await wait();
      await quickSort(arr, low, i - 1);
      await quickSort(arr, i + 1, high);
    },
    [wait, updateState, incComp]
  );

  const startSort = useCallback(async () => {
    if (sorting) return;
    stopRef.current = false;
    setSorting(true);
    setComparisons(0);
    compRef.current = 0;
    const arr = [...array];

    try {
      const sorters = { bubble: bubbleSort, selection: selectionSort, insertion: insertionSort, quick: quickSort };
      await sorters[algorithm](arr);
      const done = {};
      arr.forEach((_, i) => (done[i] = 'sorted'));
      updateState(arr, done);
    } catch {
      // stopped
    }

    setSorting(false);
  }, [array, algorithm, sorting, bubbleSort, selectionSort, insertionSort, quickSort, updateState]);

  const stop = useCallback(() => {
    stopRef.current = true;
  }, []);

  useEffect(() => {
    return () => { stopRef.current = true; };
  }, []);

  const barWidth = Math.max(2, Math.floor(800 / arraySize) - 1);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 'calc(100vh - 3.5rem)',
      background: '#09090b',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    bars: {
      flex: 1,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '1px',
      padding: '40px 24px 24px',
    },
    bar: (height, color) => ({
      width: `${barWidth}px`,
      height: `${height * 100}%`,
      backgroundColor: color,
      borderRadius: `${Math.max(1, barWidth / 4)}px ${Math.max(1, barWidth / 4)}px 0 0`,
      transition: `height ${speed < 10 ? 0 : 80}ms ease-out`,
      minWidth: '2px',
    }),
    controls: {
      padding: '16px 24px',
      background: 'rgba(24,24,27,0.95)',
      borderTop: '1px solid rgba(63,63,70,0.5)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'center',
      backdropFilter: 'blur(12px)',
    },
    select: {
      padding: '6px 12px',
      borderRadius: '8px',
      border: '1px solid rgba(63,63,70,0.8)',
      background: 'rgba(39,39,42,0.8)',
      color: '#d4d4d8',
      fontSize: '13px',
      cursor: 'pointer',
      outline: 'none',
    },
    button: (primary) => ({
      padding: '6px 16px',
      borderRadius: '8px',
      border: primary ? 'none' : '1px solid rgba(63,63,70,0.8)',
      background: primary ? '#6366f1' : 'rgba(39,39,42,0.8)',
      color: primary ? '#fff' : '#a1a1aa',
      fontSize: '13px',
      fontWeight: 500,
      cursor: sorting && !primary ? 'not-allowed' : 'pointer',
      opacity: sorting && !primary ? 0.5 : 1,
      transition: 'all 0.15s',
    }),
    controlGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    label: {
      fontSize: '13px',
      color: '#71717a',
      fontWeight: 500,
    },
    slider: {
      width: '100px',
      accentColor: '#6366f1',
      cursor: 'pointer',
    },
    value: {
      fontSize: '13px',
      color: '#52525b',
      fontFamily: 'monospace',
      minWidth: '30px',
    },
    stat: {
      fontSize: '13px',
      color: '#52525b',
      marginLeft: 'auto',
      fontFamily: 'monospace',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.bars}>
        {array.map((val, i) => (
          <div
            key={i}
            style={styles.bar(val, COLORS[colorMap[i]] || COLORS.default)}
          />
        ))}
      </div>

      <div style={styles.controls}>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          style={styles.select}
          disabled={sorting}
        >
          {Object.entries(ALGORITHMS).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>

        <div style={styles.controlGroup}>
          <span style={styles.label}>Size</span>
          <input
            type="range"
            min="10"
            max="200"
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            style={styles.slider}
            disabled={sorting}
          />
          <span style={styles.value}>{arraySize}</span>
        </div>

        <div style={styles.controlGroup}>
          <span style={styles.label}>Speed</span>
          <input
            type="range"
            min="1"
            max="100"
            value={101 - speed}
            onChange={(e) => setSpeed(101 - Number(e.target.value))}
            style={styles.slider}
          />
        </div>

        {!sorting ? (
          <>
            <button style={styles.button(true)} onClick={startSort}>
              Sort
            </button>
            <button style={styles.button(false)} onClick={generateArray}>
              Shuffle
            </button>
          </>
        ) : (
          <button
            style={{ ...styles.button(false), borderColor: '#ef4444', color: '#ef4444' }}
            onClick={stop}
          >
            Stop
          </button>
        )}

        <span style={styles.stat}>Comparisons: {comparisons}</span>
      </div>
    </div>
  );
}
