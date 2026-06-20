/* QuizNavigator — right-sidebar question number panel */

function QuizNavigator({
  count,
  currentIdx,
  answeredMap,
  onJump,
  allAnswered,
  onFinish
}) {
  const {
    useState
  } = React;
  const [collapsed, setCollapsed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const answeredCount = Object.keys(answeredMap).length;
  const unanswered = count - answeredCount;
  const handleFinishClick = () => {
    if (allAnswered) {
      onFinish();
      return;
    }
    setConfirming(true);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 14,
      border: '1px solid var(--color-border)',
      padding: '10px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: collapsed ? 0 : 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--color-text-secondary)'
    }
  }, "Navigasi Soal"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-light)'
    }
  }, answeredCount, "/", count, " dijawab")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCollapsed(c => !c),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--color-text-light)',
      padding: '2px 4px',
      fontSize: 11,
      fontWeight: 600
    }
  }, collapsed ? '▼' : '▲')), !collapsed && /*#__PURE__*/React.createElement("div", {
    className: "quiz-nav-numbers"
  }, Array.from({
    length: count
  }, (_, i) => {
    const ans = answeredMap[i];
    const isCurrent = i === currentIdx;

    /* background: current-unanswered=primary, correct=success, wrong=error, other=bg */
    const bg = isCurrent && !ans ? 'var(--color-primary)' : ans?.isCorrect ? 'var(--color-success)' : ans ? 'var(--color-error)' : 'var(--color-bg)';
    const textColor = isCurrent || ans ? '#fff' : 'var(--color-text-secondary)';

    /* extra ring when current question is already answered */
    const boxShadow = isCurrent && ans ? '0 0 0 2px var(--color-primary)' : 'none';
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => onJump(i),
      title: `Soal ${i + 1}${ans ? ans.isCorrect ? ' ✓ Benar' : ' ✗ Salah' : ' (belum dijawab)'}`,
      style: {
        width: 34,
        height: 34,
        borderRadius: 8,
        border: '1.5px solid var(--color-border)',
        background: bg,
        color: textColor,
        fontWeight: 700,
        fontSize: 12,
        cursor: 'pointer',
        transition: 'all 120ms',
        boxShadow
      }
    }, i + 1);
  })), !collapsed && /*#__PURE__*/React.createElement("div", {
    className: "quiz-nav-legend",
    style: {
      marginTop: 8,
      fontSize: 11,
      color: 'var(--color-text-light)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      background: 'var(--color-primary-bg)',
      display: 'inline-block'
    }
  }), " Sedang dikerjakan"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      background: 'var(--color-success)',
      display: 'inline-block'
    }
  }), " Benar"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      background: 'var(--color-error)',
      display: 'inline-block'
    }
  }), " Salah"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      border: '1.5px solid var(--color-border)',
      background: 'var(--color-bg)',
      display: 'inline-block'
    }
  }), " Belum dijawab")), !collapsed && onFinish && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, confirming ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-warning)',
      borderRadius: 10,
      padding: '10px 12px',
      fontSize: 12,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 4
    }
  }, "\u26A0 ", unanswered, " soal belum dijawab"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8,
      opacity: 0.9
    }
  }, "Soal yang belum dijawab dihitung salah."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirming(false),
    style: {
      flex: 1,
      padding: '5px 0',
      borderRadius: 8,
      border: '1.5px solid rgba(255,255,255,0.5)',
      background: 'transparent',
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setConfirming(false);
      onFinish();
    },
    style: {
      flex: 1,
      padding: '5px 0',
      borderRadius: 8,
      border: 'none',
      background: '#fff',
      color: 'var(--color-warning)',
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Ya, Selesai"))) : /*#__PURE__*/React.createElement("button", {
    onClick: handleFinishClick,
    style: {
      width: '100%',
      padding: '7px 0',
      borderRadius: 10,
      border: 'none',
      background: allAnswered ? 'var(--color-primary-bg)' : 'var(--color-border)',
      color: allAnswered ? '#fff' : 'var(--color-text-secondary)',
      fontSize: 12,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4
    }
  }, allAnswered ? 'Lihat Hasil' : 'Selesai', " ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 12
  }))));
}
window.QuizNavigator = QuizNavigator;