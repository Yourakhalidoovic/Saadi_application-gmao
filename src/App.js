import React, { useEffect, useState } from "react";
import { fetchItems, createItem, updateItem, deleteItem } from "./services/api";
import "./index.css";

function MainComponent() {
  // État initial
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'fr';
  });
  const [darkMode, setDarkMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showNotepad, setShowNotepad] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState("DZD");

  // États pour la calculatrice
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");

  // État pour les notes
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  // Sauvegarde des notes
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Gestion des notes
  const toggleNote = (id) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, completed: !note.completed } : note
      )
    );
  };

  const deleteNote = (id) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  // Composants
  const Calculator = () => {
    const handleCalcClick = (value) => {
      if (value === "=") {
        try {
          setCalcResult(eval(calcInput).toString());
        } catch (error) {
          setCalcResult("Erreur");
        }
      } else if (value === "C") {
        setCalcInput("");
        setCalcResult("");
      } else if (value === "DEL") {
        setCalcInput(prev => prev.slice(0, -1));
      } else {
        setCalcInput(prev => prev + value);
      }
    };

    return (
      <div className={`p-4 rounded-lg shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h2 className="text-xl font-bold mb-4">{translate("Calculatrice")}</h2>
        <div className="mb-4">
          <input
            type="text"
            value={calcInput}
            readOnly
            className="w-full p-2 mb-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            value={calcResult}
            readOnly
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"].map(btn => (
            <button
              key={btn}
              onClick={() => handleCalcClick(btn)}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {btn}
            </button>
          ))}
          <div className="col-span-2">
            <button
              onClick={() => handleCalcClick("C")}
              className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              C
            </button>
          </div>
          <div className="col-span-2">
            <button
              onClick={() => handleCalcClick("DEL")}
              className="w-full p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              DEL
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    const monthName = currentDate.toLocaleString('fr-FR', { month: 'long' });
    const year = currentDate.getFullYear();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weeks = [];
    let week = Array(7).fill(null);

    days.forEach((day, index) => {
      const dayIndex = (index + firstDayOfMonth) % 7;
      if (dayIndex === 0 && index !== 0) {
        weeks.push([...week]);
        week = Array(7).fill(null);
      }
      week[dayIndex] = day;
    });
    if (week.some(day => day !== null)) {
      weeks.push(week);
    }

    const isToday = (day) => {
      const today = new Date();
      return day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();
    };

    return (
      <div className={`p-4 rounded-lg shadow-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            ←
          </button>
          <h3 className="text-xl font-bold">
            {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
          </h3>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="text-center p-2 font-semibold text-gray-600 dark:text-gray-300">
              {day}
            </div>
          ))}
          {weeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={`
                  text-center p-2 cursor-pointer rounded
                  ${!day ? 'invisible' : ''}
                  ${isToday(day) ? 'bg-blue-500 text-white' : ''}
                  ${selectedDate.getDate() === day && !isToday(day) ? 'bg-blue-200 dark:bg-blue-700' : ''}
                  ${!isToday(day) && selectedDate.getDate() !== day ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                `}
              >
                {day}
              </div>
            ))
          ))}
        </div>
      </div>
    );
  };

  const Notepad = () => {
    const [inputNote, setInputNote] = useState("");

    const handleNoteSubmit = (e) => {
      e.preventDefault();
      if (inputNote.trim() !== "") {
        const newNote = {
          id: Date.now(),
          text: inputNote,
          completed: false,
          createdAt: new Date().toISOString()
        };
        setNotes(prev => [...prev, newNote]);
        setInputNote("");
      }
    };

    return (
      <div className={`p-4 rounded-lg shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h2 className="text-xl font-bold mb-4">{translate("Notes")}</h2>
        <form onSubmit={handleNoteSubmit} className="mb-4">
          <textarea
            value={inputNote}
            onChange={(e) => setInputNote(e.target.value)}
            className="w-full p-2 mb-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={translate("Écrivez votre note ici...")}
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {translate("Ajouter une note")}
          </button>
        </form>
        <ul className="space-y-2">
          {notes.map(note => (
            <li key={note.id} className="flex items-center justify-between p-2 border rounded dark:border-gray-600">
              <span className={note.completed ? "line-through" : ""}>{note.text}</span>
              <div>
                <button
                  onClick={() => toggleNote(note.id)}
                  className="mr-2 px-2 py-1 bg-green-600 text-white rounded"
                >
                  {note.completed ? "↩" : "✓"}
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const TYPE_CHOICES = [
    "computer",
    "printer",
    "telephone",
    "enduleur",
    "smartphone",
    "autre"
  ];

  const STATUS_CHOICES = [
    "operational",
    "maintenance"
  ];

  const CURRENCY_CHOICES = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dollar' },
    { code: 'DZD', symbol: 'DA', name: 'Dinar Algérien' }
  ];

  const formatPrice = (price) => {
    if (!price) return '';
    const currency = CURRENCY_CHOICES.find(c => c.code === selectedCurrency);
    const numPrice = parseFloat(price);
    return `${numPrice.toFixed(2)} ${currency.symbol}`;
  };

  const formatDateTime = (date) => {
    const options = { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', options);
  };

  // Traductions
  const translations = {
    fr: {
      "Gestion des Équipements": "Gestion des Équipements",
      "Ajouter un équipement": "Ajouter un équipement",
      "Modifier l'équipement": "Modifier l'équipement",
      "Type d'équipement": "Type d'équipement",
      "Nom": "Nom",
      "Statut": "Statut",
      "Client": "Client",
      "Téléphone client": "Téléphone client",
      "Prix": "Prix",
      "Ajouter et continuer": "Ajouter et continuer",
      "Paramètres": "Paramètres",
      "Mode sombre": "Mode sombre",
      "Langue": "Langue",
      "Calculatrice": "Calculatrice",
      "Notes": "Notes",
      "Calendrier": "Calendrier",
      "Rechercher": "Rechercher",
      "Entrez le prix en": "Entrez le prix en",
      "Veuillez remplir tous les champs obligatoires": "Veuillez remplir tous les champs obligatoires",
      "Équipement ajouté avec succès !": "Équipement ajouté avec succès !",
      "Erreur lors de la sauvegarde de l'équipement": "Erreur lors de la sauvegarde de l'équipement"
    },
    en: {
      "Gestion des Équipements": "Equipment Management",
      "Ajouter un équipement": "Add Equipment",
      "Modifier l'équipement": "Edit Equipment",
      "Type d'équipement": "Equipment Type",
      "Nom": "Name",
      "Statut": "Status",
      "Client": "Client",
      "Téléphone client": "Client Phone",
      "Prix": "Price",
      "Ajouter et continuer": "Add and Continue",
      "Paramètres": "Settings",
      "Mode sombre": "Dark Mode",
      "Langue": "Language",
      "Calculatrice": "Calculator",
      "Notes": "Notes",
      "Calendrier": "Calendar",
      "Rechercher": "Search",
      "Entrez le prix en": "Enter price in",
      "Veuillez remplir tous les champs obligatoires": "Please fill all required fields",
      "Équipement ajouté avec succès !": "Equipment added successfully!",
      "Erreur lors de la sauvegarde de l'équipement": "Error saving equipment"
    },
    ar: {
      "Gestion des Équipements": "إدارة المعدات",
      "Ajouter un équipement": "إضافة معدات",
      "Modifier l'équipement": "تعديل المعدات",
      "Type d'équipement": "نوع المعدات",
      "Nom": "الاسم",
      "Statut": "الحالة",
      "Client": "العميل",
      "Téléphone client": "هاتف العميل",
      "Prix": "السعر",
      "Ajouter et continuer": "إضافة والمتابعة",
      "Paramètres": "الإعدادات",
      "Mode sombre": "الوضع الداكن",
      "Langue": "اللغة",
      "Calculatrice": "الحاسبة",
      "Notes": "الملاحظات",
      "Calendrier": "التقويم",
      "Rechercher": "بحث",
      "Entrez le prix en": "أدخل السعر بـ",
      "Veuillez remplir tous les champs obligatoires": "يرجى ملء جميع الحقول المطلوبة",
      "Équipement ajouté avec succès !": "تمت إضافة المعدات بنجاح!",
      "Erreur lors de la sauvegarde de l'équipement": "خطأ في حفظ المعدات"
    }
  };

  // Fonction de traduction améliorée
  const translate = (key) => {
    return translations[language][key] || key;
  };

  // Effet pour sauvegarder la langue
  useEffect(() => {
    localStorage.setItem('language', language);
    // Mettre à jour la direction du document pour l'arabe
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const getFilteredItems = () => {
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item?.type?.toLowerCase().includes(query) ||
      item?.name?.toLowerCase().includes(query) ||
      item?.status?.toLowerCase().includes(query) ||
      item?.client?.toLowerCase().includes(query) ||
      item?.client_phone?.toLowerCase().includes(query) ||
      item?.maintenance_id?.toLowerCase().includes(query) ||
      (item?.price && item?.price.toString().toLowerCase().includes(query))
    );
  };

  const getCurrentPageItems = () => {
    const filteredItems = getFilteredItems();
    const startIndex = (currentPage - 1) * 10;
    return filteredItems.slice(startIndex, startIndex + 10);
  };

  const totalPages = Math.ceil(getFilteredItems().length / 10);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Mise à jour de la gestion du mode sombre
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }
  };

  // Fetch items on component mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        // Essayer de charger depuis l'API
        const data = await fetchItems();
        if (data && data.length > 0) {
          setItems(data);
          // Sauvegarder dans le localStorage
          localStorage.setItem('items', JSON.stringify(data));
        } else {
          // Si pas de données de l'API, charger depuis le localStorage
          const localItems = JSON.parse(localStorage.getItem('items') || '[]');
          setItems(localItems);
        }
        setLoading(false);
      } catch (err) {
        // En cas d'erreur, charger depuis le localStorage
        const localItems = JSON.parse(localStorage.getItem('items') || '[]');
        setItems(localItems);
        setError(err.message);
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setSelectedCurrency(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency);
  };

  // Fonction pour ajouter et continuer
  const handleAddAndContinue = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Validation des champs requis
      if (!newItem.type || !newItem.name || !newItem.status || !newItem.client || !newItem.client_phone) {
        setError(translate("Veuillez remplir tous les champs obligatoires"));
        return;
      }

      // Validation et traitement du prix
      let priceValue = 0; // Prix par défaut à 0 si non spécifié
      if (newItem.price && newItem.price.trim() !== "") {
        priceValue = parseFloat(newItem.price);
        if (isNaN(priceValue)) {
          setError(translate("Le prix doit être un nombre valide"));
          return;
        }
      }

      const itemData = {
        ...newItem,
        price: priceValue, // Le prix sera toujours un nombre (0 ou la valeur saisie)
        currency: selectedCurrency,
        createdAt: new Date().toISOString(),
        id: Date.now().toString(),
        maintenance_id: `MAINT-${Date.now().toString().slice(-6)}`
      };

      // Sauvegarde en API
      const savedItem = await createItem(itemData);
      
      if (!savedItem) {
        throw new Error(translate("Erreur: Pas de réponse du serveur"));
      }

      // Mise à jour du state local avec le prix formaté
      const itemWithFormattedPrice = {
        ...savedItem,
        price: savedItem.price ? `${savedItem.price} ${selectedCurrency}` : "0 ${selectedCurrency}"
      };
      setItems(prevItems => [itemWithFormattedPrice, ...prevItems]);

      // Mise à jour du localStorage
      const localItems = JSON.parse(localStorage.getItem('items') || '[]');
      localStorage.setItem('items', JSON.stringify([itemWithFormattedPrice, ...localItems]));

      // Conserver uniquement le type pour le prochain ajout
      const currentType = newItem.type;
      setNewItem({
        type: currentType,
        name: "",
        status: "",
        client: "",
        client_phone: "",
        price: "",
        maintenance_id: "",
        createdAt: ""
      });

      // Message de succès temporaire
      setError(translate("Équipement ajouté avec succès !"));
      setTimeout(() => setError(null), 3000);

    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setError(translate("Erreur lors de la sauvegarde de l'équipement"));
    }
  };

  const handleAction = (index, action) => {
    const item = getCurrentPageItems()[index];
    switch (action) {
      case "edit":
        setEditingItem(item);
        setNewItem({
          type: item.type,
          name: item.name,
          status: item.status,
          client: item.client,
          client_phone: item.client_phone,
          price: item.price,
          maintenance_id: item.maintenance_id,
          createdAt: item.createdAt
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case "delete":
        if (window.confirm(translate("Êtes-vous sûr de vouloir supprimer cet équipement ?"))) {
          deleteItem(item.id)
            .then(() => {
              setItems(prevItems => prevItems.filter(i => i.id !== item.id));
              localStorage.setItem('items', JSON.stringify(items.filter(i => i.id !== item.id)));
            })
            .catch(error => {
              console.error("Erreur lors de la suppression:", error);
              setError(translate("Erreur lors de la suppression de l'équipement"));
            });
        }
        break;
      case "markOperational":
        updateItem(item.id, { ...item, status: "operational" })
          .then(updatedItem => {
            setItems(prevItems =>
              prevItems.map(i => (i.id === updatedItem.id ? updatedItem : i))
            );
            localStorage.setItem('items', JSON.stringify(
              items.map(i => (i.id === updatedItem.id ? updatedItem : i))
            ));
          })
          .catch(error => {
            console.error("Erreur lors de la mise à jour:", error);
            setError(translate("Erreur lors de la mise à jour du statut"));
          });
        break;
      case "markMaintenance":
        updateItem(item.id, { ...item, status: "maintenance" })
          .then(updatedItem => {
            setItems(prevItems =>
              prevItems.map(i => (i.id === updatedItem.id ? updatedItem : i))
            );
            localStorage.setItem('items', JSON.stringify(
              items.map(i => (i.id === updatedItem.id ? updatedItem : i))
            ));
          })
          .catch(error => {
            console.error("Erreur lors de la mise à jour:", error);
            setError(translate("Erreur lors de la mise à jour du statut"));
          });
        break;
      default:
        break;
    }
  };

  const handleCalculator = () => {
    setShowCalculator(true);
    setShowNotepad(false);
    setShowCalendar(false);
    setShowDashboard(false);
    setShowSettings(false);
    setSidebarOpen(false);
  };

  const handleCalendar = () => {
    setShowCalendar(true);
    setShowCalculator(false);
    setShowNotepad(false);
    setShowDashboard(false);
    setShowSettings(false);
    setSidebarOpen(false);
  };

  const handleNotes = () => {
    setShowNotepad(true);
    setShowCalculator(false);
    setShowCalendar(false);
    setShowDashboard(false);
    setShowSettings(false);
    setSidebarOpen(false);
  };

  const handleDashboard = () => {
    setShowDashboard(true);
    setShowNotepad(false);
    setShowCalculator(false);
    setShowCalendar(false);
    setShowSettings(false);
    setSidebarOpen(false);
  };

  const handleSettings = () => {
    setShowSettings(true);
    setShowDashboard(false);
    setShowNotepad(false);
    setShowCalculator(false);
    setShowCalendar(false);
    setSidebarOpen(false);
  };

  const handlePrint = (item) => {
    if (!item) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString();

    const printContent = `
      <div class="shadow p-6 max-w-2xl mx-auto">
        <h2 style="text-align: center; font-size: 24px; margin-bottom: 20px;">
          Bon de Service
        </h2>
        <div style="margin-bottom: 15px;">
          <p><strong>Client:</strong> ${item?.client || ""}</p>
          <p><strong>Téléphone du client:</strong> ${item?.client_phone || ""
      }</p>
          <p><strong>Type d'équipement:</strong> ${translate(item?.type || ""
      )}</p>
          <p><strong>Nom de l'équipement:</strong> ${item?.name || ""
      }</p>
          <p><strong>Statut:</strong> ${translate(item?.status || ""
      )}</p>
          <p><strong>Prix:</strong> ${formatPrice(item?.price || ""
      )}</p>
          <p><strong>ID de maintenance:</strong> ${item?.maintenance_id || ""
      }</p>
          <p><strong>Date:</strong> ${currentDate}</p>
        </div>
      </div>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bon de Service</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              padding: 20px;
              color: black;
              background-color: white;
            }
            .shadow {
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              padding: 20px;
              border-radius: 8px;
            }
            @media print {
              body { 
                color: black;
                background-color: white;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <div style="text-align: center; margin-top: 30px;">
            <p>Merci pour votre confiance!</p>
            <p>Ydaoudi technologie</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      try {
        printWindow.print();
        printWindow.close();
      } catch (e) {
        console.error("Erreur lors de l'impression:", e);
      }
    }, 500);
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Type,Name,Status,Client,Client Phone,Price,Maintenance ID\n" +
      items
        .filter((item) => item) // Filter out null/undefined items
        .map((item) =>
          [
            translate(item?.type || ""),
            item?.name || "",
            translate(item?.status || ""),
            item?.client || "",
            item?.client_phone || "",
            formatPrice(item?.price || ""),
            item?.maintenance_id || "",
          ].join(",")
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "equipment_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const [newItem, setNewItem] = useState({
    type: "",
    name: "",
    status: "",
    client: "",
    client_phone: "",
    price: "",
    maintenance_id: "",
    createdAt: ""
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <nav className="bg-white dark:bg-gray-800 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                {translate("Système GMAO / CMMS")}
              </span>
            </div>

            <div className="flex md:order-2 space-x-3">
              <div className="text-gray-500 dark:text-gray-400 hidden md:flex items-center">
                {formatDateTime(new Date())}
              </div>
              <button
                onClick={handleExport}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {language === 'fr' ? 'Exporter CSV' : 'Export CSV'}
              </button>
              <button
                type="button"
                onClick={toggleDarkMode}
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Barre latérale */}
        <div
          className={`fixed top-0 left-0 h-full w-64 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-lg z-40 mt-16 pt-4`}
        >
          <div className="flex flex-col space-y-2 p-4">
            <button
              onClick={handleDashboard}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <span>📊</span>
              <span>{translate("Tableau de bord")}</span>
            </button>
            
            <button
              onClick={handleCalculator}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <span>🧮</span>
              <span>{translate("Calculatrice")}</span>
            </button>

            <button
              onClick={handleCalendar}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <span>📅</span>
              <span>{translate("Calendrier")}</span>
            </button>

            <button
              onClick={handleNotes}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <span>📝</span>
              <span>{translate("Notes")}</span>
            </button>

            <button
              onClick={handleSettings}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <span>⚙️</span>
              <span>{translate("Paramètres")}</span>
            </button>

            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 rounded-lg bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <main className="p-4 pt-20">
          <div className="container mx-auto">
            {showDashboard && (
              <div className="space-y-8">
                {/* Formulaire */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {editingItem ? translate("Modifier l'équipement") : translate("Ajouter un équipement")}
                  </h2>
                  <form onSubmit={handleAddAndContinue} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {translate("Type")}
                        </label>
                        <select
                          name="type"
                          value={newItem.type}
                          onChange={handleInputChange}
                          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">{translate("Sélectionner un type")}</option>
                          {TYPE_CHOICES.map((type) => (
                            <option key={type} value={type}>
                              {translate(type)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {translate("Nom")}
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={newItem.name}
                          onChange={handleInputChange}
                          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {translate("État")}
                        </label>
                        <select
                          name="status"
                          value={newItem.status}
                          onChange={handleInputChange}
                          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">{translate("Sélectionner un état")}</option>
                          {STATUS_CHOICES.map((status) => (
                            <option key={status} value={status}>
                              {translate(status)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {translate("Client")}
                        </label>
                        <input
                          type="text"
                          name="client"
                          value={newItem.client}
                          onChange={handleInputChange}
                          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {translate("Contact")}
                        </label>
                        <input
                          type="tel"
                          name="client_phone"
                          value={newItem.client_phone}
                          onChange={handleInputChange}
                          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      {/* Champ Prix avec style amélioré */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {translate("Prix")} ({selectedCurrency})
                        </label>
                        <div className="flex rounded-md shadow-sm">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="price"
                            value={newItem.price}
                            onChange={handleInputChange}
                            className="flex-1 p-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                          <select
                            value={selectedCurrency}
                            onChange={handleCurrencyChange}
                            className="p-2 rounded-r-md border-l-0 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="DZD">DZD</option>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {translate("Entrez le prix en")} {selectedCurrency}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {translate("ID Maintenance")}
                        </label>
                        <input
                          type="text"
                          name="maintenance_id"
                          value={newItem.maintenance_id}
                          onChange={handleInputChange}
                          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className={`flex flex-col space-y-4 mt-6 ${language === 'ar' ? 'items-start' : 'items-end'}`}>
                      {error && (
                        <div className={`p-4 rounded-lg w-full ${
                          error.includes("succès") || error.includes("success") || error.includes("بنجاح")
                            ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                            : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
                        }`}>
                          {error}
                        </div>
                      )}
                      <div className="flex justify-end w-full">
                        <button
                          type="submit"
                          className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center space-x-2 transition-colors duration-200 ${
                            language === 'ar' ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <span>{translate("Ajouter et continuer")}</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Tableau */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder={translate("Rechercher par type, nom, client, statut...")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate("Type")}
                          </th>
                          <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate("Nom")}
                          </th>
                          <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate("État")}
                          </th>
                          <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate("Client")}
                          </th>
                          <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate("Contact")}
                          </th>
                          <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate("Action")}
                          </th>
                          <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate("Prix")}
                          </th>
                          <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate("ID Maintenance")}
                          </th>
                          <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate("Imprimer")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {getCurrentPageItems().map((item) => (
                          <tr
                            key={item.id || Math.random()}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="p-4 text-gray-900 dark:text-gray-300">
                              {TYPE_CHOICES.find(type => type === item?.type)
                                ? translate(item.type)
                                : item?.type || ""}
                            </td>
                            <td className="p-4 text-gray-900 dark:text-gray-300">{item?.name || ""}</td>
                            <td className="p-4 text-gray-900 dark:text-gray-300">
                              {STATUS_CHOICES.find(status => status === item?.status)
                                ? translate(item.status)
                                : item?.status || ""}
                            </td>
                            <td className="p-4 text-gray-900 dark:text-gray-300">{item?.client || ""}</td>
                            <td className="p-4 text-gray-900 dark:text-gray-300">{item?.client_phone || ""}</td>
                            <td className="p-4">
                              <select
                                className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                onChange={(e) => handleAction(getCurrentPageItems().indexOf(item), e.target.value)}
                                value=""
                              >
                                <option value="">{translate("Sélectionner une action")}</option>
                                <option value="edit">{translate("Modifier")}</option>
                                <option value="delete">{translate("Supprimer")}</option>
                                <option value="markOperational">{translate("Marquer opérationnel")}</option>
                                <option value="markMaintenance">{translate("Marquer en maintenance")}</option>
                              </select>
                            </td>
                            <td className="p-4 text-gray-900 dark:text-gray-300">
                              {item?.price ? `${item.price} ${selectedCurrency}` : ""}
                            </td>
                            <td className="p-4 text-gray-900 dark:text-gray-300">{item?.maintenance_id || ""}</td>
                            <td className="p-4">
                              <button
                                onClick={() => handlePrint(item)}
                                className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg dark:bg-blue-500 dark:hover:bg-blue-600"
                              >
                                🖨️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {translate("Total")} : {items.length} {translate("équipements")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
                      >
                        {translate("Précédent")}
                      </button>
                      
                      {/* Numéros de page */}
                      <div className="flex space-x-1">
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-3 py-1 rounded-lg ${
                              currentPage === index + 1
                                ? "bg-blue-600 text-white dark:bg-blue-500"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
                      >
                        {translate("Suivant")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showCalculator && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <Calculator />
              </div>
            )}

            {showCalendar && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <Calendar />
              </div>
            )}

            {showNotepad && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <Notepad />
              </div>
            )}

            {showSettings && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                {/* Contenu des paramètres */}
                <select
                  value={selectedCurrency}
                  onChange={handleCurrencyChange}
                  className="w-24 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {CURRENCY_CHOICES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainComponent;
