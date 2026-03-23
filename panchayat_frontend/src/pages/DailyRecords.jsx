import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoaderSpinner from '../components/LoaderSpinner';

const DailyRecords = () => {
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        employeeId: '',
        workName: '',
        employeeCenter: '',
        employeeGroup: '',
        employeeBody: '',
        workType: 'field',
        languageEvidence: '',
        duration: '',
        description: '',
        location: ''
    });

    useEffect(() => {
        fetchRecords();
        fetchEmployees();
    }, [selectedDate]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/daily-record?date=${selectedDate}`);
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/employee');
            setEmployees(response.data.filter(emp => emp.status === 'active'));
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSend = {
                ...formData,
                recordDate: selectedDate,
                duration: parseFloat(formData.duration)
            };
            
            if (editingId) {
                await axios.put(`http://localhost:5000/api/daily-record/${editingId}`, dataToSend);
            } else {
                await axios.post('http://localhost:5000/api/daily-record', dataToSend);
            }
            fetchRecords();
            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error('Error saving record:', error);
            alert('રેકોર્ડ સેવ કરવામાં ભૂલ');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            employeeId: '',
            workName: '',
            employeeCenter: '',
            employeeGroup: '',
            employeeBody: '',
            workType: 'field',
            languageEvidence: '',
            duration: '',
            description: '',
            location: ''
        });
    };

    const handleEdit = (record) => {
        setEditingId(record._id);
        setFormData({
            employeeId: record.employeeId._id,
            workName: record.workName,
            employeeCenter: record.employeeCenter || '',
            employeeGroup: record.employeeGroup || '',
            employeeBody: record.employeeBody || '',
            workType: record.workType,
            languageEvidence: record.languageEvidence || '',
            duration: record.duration,
            description: record.description || '',
            location: record.location || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('શું તમે આ રેકોર્ડ ડિલીટ કરવા માંગો છો?')) {
            try {
                await axios.delete(`http://localhost:5000/api/daily-record/${id}`);
                fetchRecords();
            } catch (error) {
                console.error('Error deleting record:', error);
            }
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/daily-record/${id}/status`, { status });
            fetchRecords();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getWorkTypeLabel = (type) => {
        const types = {
            field: 'ફિલ્ડ',
            office: 'ઓફિસ',
            survey: 'સર્વે',
            meeting: 'મીટીંગ',
            other: 'અન્ય'
        };
        return types[type] || type;
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">રોજની વિગત (રાજની વિગત)</h1>
                <p className="text-gray-600 mt-1">કર્મચારીઓની દૈનિક કામની વિગતો નોંધો</p>
            </div>

            {/* Date Selector and Add Button */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <label className="font-medium text-gray-700">તારીખ:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                        onClick={fetchRecords}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        શોધો
                    </button>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    {showForm ? 'ફોર્મ બંધ કરો' : '+ નવું રેકોર્ડ'}
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        {editingId ? 'રેકોર્ડ સુધારો' : 'નવું રેકોર્ડ ઉમેરો'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">કર્મચારી *</label>
                                <select name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required>
                                    <option value="">કર્મચારી પસંદ કરો</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.employeeCode} - {emp.firstName} {emp.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">રણની નાવીમ (કામનું નામ) *</label>
                                <input type="text" name="workName" value={formData.workName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">કર્મચારીનુ મધ્ય (વિભાગ)</label>
                                <input type="text" name="employeeCenter" value={formData.employeeCenter} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">કર્મચારીનુ જૂથ</label>
                                <input type="text" name="employeeGroup" value={formData.employeeGroup} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">કર્મચારીના બોડી</label>
                                <input type="text" name="employeeBody" value={formData.employeeBody} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">રણની પ્રકાર *</label>
                                <select name="workType" value={formData.workType} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                                    <option value="field">ફિલ્ડ વર્ક</option>
                                    <option value="office">ઓફિસ વર્ક</option>
                                    <option value="survey">સર્વે</option>
                                    <option value="meeting">મીટીંગ</option>
                                    <option value="other">અન્ય</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">પાઠ ભાષા સાક્ષિ</label>
                                <input type="text" name="languageEvidence" value={formData.languageEvidence} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">દીર્ઘાઈ (કલાકમાં) *</label>
                                <input type="number" name="duration" value={formData.duration} onChange={handleChange} step="0.5" className="w-full px-3 py-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">સ્થળ</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">વર્ણન</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-3 py-2 border rounded-md"></textarea>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                {loading ? <LoaderSpinner /> : (editingId ? 'અપડેટ કરો' : 'સેવ કરો')}
                            </button>
                            <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                                રદ કરો
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Records Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">રોજની રેકોર્ડ યાદી - {selectedDate}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">કર્મચારી</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">કામનું નામ</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">વિભાગ</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">પ્રકાર</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">સમય</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">સ્થળ</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">સ્થિતિ</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ક્રિયા</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && records.length === 0 ? (
                                <tr><td colSpan="8" className="px-4 py-4 text-center"><LoaderSpinner /></td></tr>
                            ) : records.length === 0 ? (
                                <tr><td colSpan="8" className="px-4 py-4 text-center text-gray-500">આ તારીખે કોઈ રેકોર્ડ નથી</td></tr>
                            ) : (
                                records.map(record => (
                                    <tr key={record._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {record.employeeId?.firstName} {record.employeeId?.lastName}
                                            <br/><span className="text-xs text-gray-500">{record.employeeId?.employeeCode}</span>
                                        </td>
                                        <td className="px-4 py-3">{record.workName}</td>
                                        <td className="px-4 py-3">{record.employeeCenter || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${record.workType === 'field' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {getWorkTypeLabel(record.workType)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{record.duration} કલાક</td>
                                        <td className="px-4 py-3">{record.location || '-'}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={record.status}
                                                onChange={(e) => updateStatus(record._id, e.target.value)}
                                                className={`px-2 py-1 text-xs rounded border ${record.status === 'approved' ? 'bg-green-100' : record.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'}`}
                                            >
                                                <option value="pending">બાકી</option>
                                                <option value="approved">મંજૂર</option>
                                                <option value="rejected">નામંજૂર</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-900 mr-2">✏️</button>
                                            <button onClick={() => handleDelete(record._id)} className="text-red-600 hover:text-red-900">🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">કુલ કર્મચારીઓ</h3>
                    <p className="text-2xl font-bold text-gray-800">{records.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">કુલ કામના કલાક</h3>
                    <p className="text-2xl font-bold text-gray-800">{records.reduce((sum, r) => sum + r.duration, 0)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">મંજૂર રેકોર્ડ</h3>
                    <p className="text-2xl font-bold text-green-600">{records.filter(r => r.status === 'approved').length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">બાકી રેકોર્ડ</h3>
                    <p className="text-2xl font-bold text-yellow-600">{records.filter(r => r.status === 'pending').length}</p>
                </div>
            </div>
        </div>
    );
};

export default DailyRecords;

