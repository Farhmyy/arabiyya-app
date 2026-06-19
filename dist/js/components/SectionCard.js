/* SectionCard — Navigation tile for chapter sections */

function SectionCard({
  icon,
  titleAr,
  titleId,
  subtitle,
  status = 'open',
  accent = 'primary',
  onClick
}) {
  const gradients = {
    primary: 'linear-gradient(180deg, #0F766E, #115E59)',
    secondary: 'linear-gradient(180deg, #14B8A6, #0D9488)',
    gold: 'linear-gradient(180deg, #F59E0B, #D97706)',
    purple: 'linear-gradient(180deg, #8B5CF6, #7C3AED)',
    teal: 'linear-gradient(180deg, #06B6D4, #0891B2)',
    neutral: 'linear-gradient(180deg, #94A3B8, #64748B)'
  };
  const locked = status === 'locked';
  return /*#__PURE__*/React.createElement(Card, {
    hover: !locked,
    onClick: locked ? undefined : onClick,
    padding: 20,
    style: locked ? {
      opacity: 0.55,
      cursor: 'not-allowed',
      userSelect: 'none'
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 16,
      background: gradients[accent] || gradients.primary,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: locked ? 'lock' : icon,
    size: 26
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-arabic)',
      fontSize: 24,
      fontWeight: 700,
      color: 'var(--color-primary)',
      lineHeight: 1.3
    }
  }, titleAr), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--color-text-primary)',
      marginTop: 2
    }
  }, titleId), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-secondary)',
      marginTop: 4
    }
  }, subtitle)), status === 'done' && /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 22,
    color: "var(--color-success)"
  }), status === 'open' && /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 22,
    color: "var(--color-text-light)"
  }), status === 'locked' && /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 22,
    color: "var(--color-text-light)"
  })));
}
window.SectionCard = SectionCard;