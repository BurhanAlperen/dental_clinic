'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X, Sparkles } from 'lucide-react';
import styles from './SearchableServiceSelect.module.css';

export const APPOINTMENT_SERVICES = [
  { id: 'dis-beyazlatma', name: 'Diş Beyazlatma', category: 'Estetik' },
  { id: 'kanal-tedavisi', name: 'Kanal Tedavisi', category: 'Tedavi' },
  { id: 'dolgu', name: 'Dolgu', category: 'Tedavi' },
  { id: 'dis-tasi-temizligi', name: 'Diş Taşı Temizliği', category: 'Koruyucu' },
  { id: 'zirkonyum', name: 'Zirkonyum', category: 'Protez & Estetik' },
  { id: 'implant', name: 'İmplant', category: 'Cerrahi' },
];

export default function SearchableServiceSelect({ selectedServices = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when opening
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredServices = APPOINTMENT_SERVICES.filter((service) =>
    service.name.toLocaleLowerCase('tr').includes(searchTerm.toLocaleLowerCase('tr'))
  );

  const toggleService = (serviceName) => {
    if (selectedServices.includes(serviceName)) {
      onChange(selectedServices.filter((s) => s !== serviceName));
    } else {
      onChange([...selectedServices, serviceName]);
    }
  };

  const removeService = (e, serviceName) => {
    e.stopPropagation();
    onChange(selectedServices.filter((s) => s !== serviceName));
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <label className={styles.label}>
        <span>Almak İstediğiniz Hizmet</span>
        <span className={styles.required}>*</span>
        {selectedServices.length > 0 && (
          <span className={styles.countBadge}>{selectedServices.length} hizmet seçildi</span>
        )}
      </label>

      {/* Main Trigger Button */}
      <div
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''} ${
          selectedServices.length === 0 ? styles.triggerEmpty : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={styles.selectedWrapper}>
          {selectedServices.length === 0 ? (
            <span className={styles.placeholder}>Hizmet seçiniz (Birden fazla seçebilirsiniz)...</span>
          ) : (
            <div className={styles.chipsContainer}>
              {selectedServices.map((service) => (
                <span key={service} className={styles.chip}>
                  {service}
                  <button
                    type="button"
                    className={styles.chipRemove}
                    onClick={(e) => removeService(e, service)}
                    aria-label={`${service} seçimini kaldır`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronDown size={18} className={`${styles.chevron} ${isOpen ? styles.chevronRotated : ''}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          {/* Search Box */}
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Hizmetler arasında arayın (örn: Dolgu, İmplant)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setSearchTerm('')}
                aria-label="Aramayı temizle"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Service Options with Checkboxes */}
          <div className={styles.optionsList}>
            {filteredServices.length === 0 ? (
              <div className={styles.noResults}>
                <span>Aradığınız kriterlere uygun hizmet bulunamadı.</span>
              </div>
            ) : (
              filteredServices.map((service) => {
                const isSelected = selectedServices.includes(service.name);
                return (
                  <div
                    key={service.id}
                    className={`${styles.optionItem} ${isSelected ? styles.optionSelected : ''}`}
                    onClick={() => toggleService(service.name)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className={`${styles.checkbox} ${isSelected ? styles.checkboxActive : ''}`}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                    <div className={styles.optionInfo}>
                      <span className={styles.optionName}>{service.name}</span>
                      <span className={styles.optionCategory}>{service.category}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
