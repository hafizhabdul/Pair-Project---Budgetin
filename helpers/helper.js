const formatCurrency = (amount) => {
    return `Rp ${parseFloat(amount).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  module.exports = { formatCurrency, formatDate };