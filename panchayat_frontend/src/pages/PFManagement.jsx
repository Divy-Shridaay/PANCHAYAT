import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoaderSpinner from '../components/LoaderSpinner';

const PFManagement = () => {
    const [pfRecords, setPfRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        employeeId: '',
        basicSalary: '',
        depositDate: '',
        transactionId: '',
        paymentMode: 'bank transfer',
        remarks: ''
    });

    useEffect(() => {
        fetchPFRecords();
        fetchEmployees();
    }, [selectedMonth, selectedYear]);

    const fetchPFRecords = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/pf?month=${selectedMonth}&year=${selectedYear}`);
            setPfRecords(response.data);
        } catch (error) {
            console.error('Error fetching PF records:', error);
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

    const calculatePF = (basicSalary) => {
        const employeePF = basicSalary * 0.12;
        const employerPF = basicSalary * 0.12;
        return { employeePF, employerPF, totalPF: employeePF + employerPF };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { employeePF, employerPF, totalPF } = calculatePF(parseFloat(formData.basicSalary));
            const dataToSend = {
                ...formData,
                month: selectedMonth,
                year: selectedYear,
                basicSalary: parseFloat(formData.basicSalary),
                pfContributionEmployee: employeePF,
                pfContributionEmployer: employerPF,
                totalPF: totalPF,
                depositDate: formData.depositDate || new Date()
            };
            
            if (editingId) {
                await axios.put(`http://localhost:5000/api/pf/${editingId}`, dataToSend);
            } else {
                await axios.post('http://localhost:5000/api/pf', dataToSend);
            }
            fetchPFRecords();
            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error('Error saving PF record:', error);
            alert('PF રેકોર્ડ સેવ કરવામાં ભૂલ');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            employeeId: '',
            basicSalary: '',
            depositDate: '',
            transactionId: '',
            paymentMode: 'bank transfer',
            remarks: ''
        });
    };

    const handleEdit = (record) => {
        setEditingId(record._id);
        setFormData({
            employeeId: record.employeeId._id,
            basicSalary: record.basicSalary,
            depositDate: record.depositDate ? record.depositDate.split('T')[0] : '',
            transactionId: record.transactionId || '',
            paymentMode: record.paymentMode || 'bank transfer',
            remarks: record.remarks || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('શું તમે આ PF રેકોર્ડ ડિલીટ કરવા માંગો છો?')) {
            try {
                await axios.delete(`http://localhost:5000/api/pf/${id}`);
                fetchPFRecords();
            } catch (error) {
                console.error('Error deleting PF record:', error);
            }
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/pf/${id}/status`, { status });
            fetchPFRecords();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getPaymentModeLabel = (mode) => {
        const modes = {
            cash: 'રોકડ',
            cheque: 'ચેક',
            'bank transfer': 'બેંક ટ્રાન્સફર',
            online: 'ઓનલાઈન'
        };
        return modes[mode] || mode;
    };

    const totalSummary = pfRecords.reduce((acc, curr) => ({
        totalBasicSalary: acc.totalBasicSalary + curr.basicSalary,
        totalEmployeePF: acc.totalEmployeePF + curr.pfContributionEmployee,
        totalEmployerPF: acc.totalEmployerPF + curr.pfContributionEmployer,
        totalPF: acc.totalPF + curr.totalPF
    }), { totalBasicSalary: 0, totalEmployeePF: 0, totalEmployerPF: 0, totalPF: 0 });

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">પી.એફ. જમા/ઉપાડ (PF Management)</h1>
                <p className="text-gray-600 mt-1">કર્મચારીઓના PF યોગદાનનું સંચાલન</p>
            </div>

            {/* Month/Year Selector and Add Button */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <label className="text-sm text-gray-600 mr-2">મહિનો:</label>
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-2 border rounded-md">
                            <option value="1">જાન્યુઆરી</option>
                            <option value="2">ફેબ્રુઆરી</option>
                            <option value="3">માર્ચ</option>
                            <option value="4">એપ્રિલ</option>
                            <option value="5">મે</option>
                            <option value="6">જૂન</option>
                            <option value="7">જુલાઈ</option>
                            <option value="8">ઑગસ્ટ</option>
                            <option value="9">સપ્ટેમ્બર</option>
                            <option value="10">ઑક્ટોબર</option>
                            <option value="11">નવેમ્બર</option>
                            <option value="12">ડિસેમ્બર</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600 mr-2">વર્ષ:</label>
                        <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-2 border rounded-md w-24" />
                    </div>
                    <button onClick={fetchPFRecords} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        શોધો
                    </button>
                </div>
                <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    {showForm ? 'ફોર્મ બંધ કરો' : '+ નવી PF એન્ટ્રી'}
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        {editingId ? 'PF રેકોર્ડ સુધારો' : 'નવી PF એન્ટ્રી'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">મૂળ પગાર (₹) *</label>
                                <input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                                {formData.basicSalary && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        PF: કર્મચારી: ₹{(formData.basicSalary * 0.12).toFixed(2)} | 
                                        સંસ્થા: ₹{(formData.basicSalary * 0.12).toFixed(2)} | 
                                        કુલ: ₹{(formData.basicSalary * 0.24).toFixed(2)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">જમા તારીખ</label>
                                <input type="date" name="depositDate" value={formData.depositDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ટ્રાન્ઝેક્શન ID</label>
                                <input type="text" name="transactionId" value={formData.transactionId} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ચુકવણીનો પ્રકાર</label>
                                <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                                    <option value="cash">રોકડ</option>
                                    <option value="cheque">ચેક</option>
                                    <option value="bank transfer">બેંક ટ્રાન્સફર</option>
                                    <option value="online">ઓનલાઈન</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">નોંધ</label>
                                <input type="text" name="remarks" value={formData.remarks} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
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

            {/* PF Records Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">PF રેકોર્ડ યાદી - {selectedMonth}/{selectedYear}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">કર્મચારી</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">મૂળ પગાર</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">કર્મચારી PF (12%)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">સંસ્થા PF (12%)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">કુલ PF</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">જમા તારીખ</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">સ્થિતિ</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ક્રિયા</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && pfRecords.length === 0 ? (
                                <tr><td colSpan="8" className="px-4 py-4 text-center"><LoaderSpinner /></td></tr>
                            ) : pfRecords.length === 0 ? (
                                <tr><td colSpan="8" className="px-4 py-4 text-center text-gray-500">કોઈ PF રેકોર્ડ નથી</td></tr>
                            ) : (
                                pfRecords.map(record => (
                                    <tr key={record._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {record.employeeId?.firstName} {record.employeeId?.lastName}
                                            <br/><span className="text-xs text-gray-500">{record.employeeId?.employeeCode}</span>
                                        </td>
                                        <td className="px-4 py-3">₹{record.basicSalary.toLocaleString()}</td>
                                        <td className="px-4 py-3">₹{record.pfContributionEmployee.toLocaleString()}</td>
                                        <td className="px-4 py-3">₹{record.pfContributionEmployer.toLocaleString()}</td>
                                        <td className="px-4 py-3 font-semibold">₹{record.totalPF.toLocaleString()}</td>
                                        <td className="px-4 py-3">{record.depositDate ? new Date(record.depositDate).toLocaleDateString() : '-'}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={record.status}
                                                onChange={(e) => updateStatus(record._id, e.target.value)}
                                                className={`px-2 py-1 text-xs rounded border ${record.status === 'deposited' ? 'bg-green-100 text-green-800' : record.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                                            >
                                                <option value="pending">બાકી</option>
                                                <option value="deposited">જમા</option>
                                                <option value="failed">નિષ્ફળ</option>
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
                    <h3 className="text-sm text-gray-500">કુલ મૂળ પગાર</h3>
                    <p className="text-xl font-bold text-gray-800">₹{totalSummary.totalBasicSalary.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">કુલ કર્મચારી PF</h3>
                    <p className="text-xl font-bold text-blue-600">₹{totalSummary.totalEmployeePF.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">કુલ સંસ્થા PF</h3>
                    <p className="text-xl font-bold text-green-600">₹{totalSummary.totalEmployerPF.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">કુલ PF જમા</h3>
                    <p className="text-xl font-bold text-purple-600">₹{totalSummary.totalPF.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

export default PFManagement;