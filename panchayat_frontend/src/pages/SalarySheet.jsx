import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoaderSpinner from '../components/LoaderSpinner';

const SalarySheet = () => {
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        basicSalary: ''
    });

    useEffect(() => {
        fetchSalaries();
        fetchEmployees();
    }, [selectedMonth, selectedYear]);

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/salary?month=${selectedMonth}&year=${selectedYear}`);
            setSalaries(response.data);
        } catch (error) {
            console.error('Error fetching salaries:', error);
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

    const calculateSalary = (basicSalary) => {
        const da = basicSalary * 0.5;
        const hra = basicSalary * 0.2;
        const ta = basicSalary * 0.1;
        const medical = 1250;
        const grossSalary = basicSalary + da + hra + ta + medical;
        const pf = basicSalary * 0.12;
        const esi = basicSalary <= 21000 ? basicSalary * 0.0075 : 0;
        const professionalTax = basicSalary > 15000 ? 200 : 0;
        const totalDeductions = pf + esi + professionalTax;
        const netSalary = grossSalary - totalDeductions;
        
        return { da, hra, ta, medical, grossSalary, pf, esi, professionalTax, totalDeductions, netSalary };
    };

    const handleGenerate = async () => {
        if (!formData.employeeId || !formData.basicSalary) {
            alert('કૃપા કરી કર્મચારી અને મૂળ પગાર પસંદ કરો');
            return;
        }
        
        setLoading(true);
        try {
            const { da, hra, ta, medical, grossSalary, pf, esi, professionalTax, totalDeductions, netSalary } = 
                calculateSalary(parseFloat(formData.basicSalary));
            
            await axios.post('http://localhost:5000/api/salary/generate', {
                employeeId: formData.employeeId,
                month: selectedMonth,
                year: selectedYear,
                basicSalary: parseFloat(formData.basicSalary),
                allowances: { da, hra, ta, medical, special: 0, other: 0 },
                deductions: { pf, esi, professionalTax, tds: 0, advance: 0, other: 0 },
                grossSalary,
                netSalary
            });
            fetchSalaries();
            setFormData({ employeeId: '', basicSalary: '' });
            setShowForm(false);
            alert('પગાર સફળતાપૂર્વક જનરેટ થયો');
        } catch (error) {
            console.error('Error generating salary:', error);
            alert('પગાર જનરેટ કરવામાં ભૂલ');
        } finally {
            setLoading(false);
        }
    };

    const updateSalaryStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/salary/${id}/status`, {
                status,
                paymentDate: new Date(),
                paymentMode: 'bank transfer'
            });
            fetchSalaries();
        } catch (error) {
            console.error('Error updating salary status:', error);
        }
    };

    const totals = salaries.reduce((acc, curr) => ({
        totalGross: acc.totalGross + curr.grossSalary,
        totalNet: acc.totalNet + curr.netSalary,
        totalPF: acc.totalPF + curr.deductions.pf
    }), { totalGross: 0, totalNet: 0, totalPF: 0 });

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">પગાર પત્રક (Salary Sheet)</h1>
                <p className="text-gray-600 mt-1">કર્મચારીઓનો માસિક પગાર જનરેટ કરો અને વ્યવસ્થાપન કરો</p>
            </div>

            {/* Month/Year Selector and Generate Button */}
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
                    <button onClick={fetchSalaries} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        શોધો
                    </button>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    {showForm ? 'ફોર્મ બંધ કરો' : '+ પગાર જનરેટ કરો'}
                </button>
            </div>

            {/* Generate Salary Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">નવો પગાર જનરેટ કરો</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">કર્મચારી *</label>
                            <select name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
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
                            <input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                    </div>
                    {formData.basicSalary && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                            <h3 className="font-semibold text-gray-700 mb-2">પગાર ગણતરી:</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <p><strong>DA (50%):</strong> ₹{(formData.basicSalary * 0.5).toFixed(2)}</p>
                                <p><strong>HRA (20%):</strong> ₹{(formData.basicSalary * 0.2).toFixed(2)}</p>
                                <p><strong>TA (10%):</strong> ₹{(formData.basicSalary * 0.1).toFixed(2)}</p>
                                <p><strong>Medical:</strong> ₹1250</p>
                                <p><strong>Gross Salary:</strong> ₹{(formData.basicSalary * 1.8 + 1250).toFixed(2)}</p>
                                <p><strong>PF (12%):</strong> ₹{(formData.basicSalary * 0.12).toFixed(2)}</p>
                                <p><strong>Net Salary:</strong> ₹{(formData.basicSalary * 1.8 + 1250 - formData.basicSalary * 0.12 - (formData.basicSalary <= 21000 ? formData.basicSalary * 0.0075 : 0) - (formData.basicSalary > 15000 ? 200 : 0)).toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                    <div className="mt-4">
                        <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {loading ? <LoaderSpinner /> : 'પગાર જનરેટ કરો'}
                        </button>
                    </div>
                </div>
            )}

            {/* Salary Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">પગાર યાદી - {selectedMonth}/{selectedYear}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">કર્મચારી</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">મૂળ પગાર</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">DA</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">HRA</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">TA</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">ગ્રોસ</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">PF</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">ESI</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">નેટ</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">સ્થિતિ</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">ક્રિયા</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && salaries.length === 0 ? (
                                <tr><td colSpan="11" className="px-4 py-4 text-center"><LoaderSpinner /></td></tr>
                            ) : salaries.length === 0 ? (
                                <tr><td colSpan="11" className="px-4 py-4 text-center text-gray-500">કોઈ પગાર રેકોર્ડ નથી</td></tr>
                            ) : (
                                salaries.map(salary => (
                                    <tr key={salary._id} className="hover:bg-gray-50">
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            {salary.employeeId?.firstName} {salary.employeeId?.lastName}
                                            <br/><span className="text-xs text-gray-500">{salary.employeeId?.employeeCode}</span>
                                        </td>
                                        <td className="px-3 py-3">₹{salary.basicSalary.toLocaleString()}</td>
                                        <td className="px-3 py-3">₹{salary.allowances?.da.toLocaleString()}</td>
                                        <td className="px-3 py-3">₹{salary.allowances?.hra.toLocaleString()}</td>
                                        <td className="px-3 py-3">₹{salary.allowances?.ta.toLocaleString()}</td>
                                        <td className="px-3 py-3 font-semibold">₹{salary.grossSalary.toLocaleString()}</td>
                                        <td className="px-3 py-3">₹{salary.deductions?.pf.toLocaleString()}</td>
                                        <td className="px-3 py-3">₹{salary.deductions?.esi.toLocaleString()}</td>
                                        <td className="px-3 py-3 font-bold text-green-600">₹{salary.netSalary.toLocaleString()}</td>
                                        <td className="px-3 py-3">
                                            <select
                                                value={salary.status}
                                                onChange={(e) => updateSalaryStatus(salary._id, e.target.value)}
                                                className={`px-2 py-1 text-xs rounded border ${salary.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                            >
                                                <option value="pending">બાકી</option>
                                                <option value="paid">ચૂકવેલ</option>
                                                <option value="cancelled">રદ</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-3">
                                            {salary.status === 'pending' && (
                                                <button onClick={() => updateSalaryStatus(salary._id, 'paid')} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                                                    ચૂકવણી
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">કુલ ગ્રોસ પગાર</h3>
                    <p className="text-xl font-bold text-gray-800">₹{totals.totalGross.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">કુલ નેટ પગાર</h3>
                    <p className="text-xl font-bold text-green-600">₹{totals.totalNet.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">કુલ PF</h3>
                    <p className="text-xl font-bold text-blue-600">₹{totals.totalPF.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

export default SalarySheet;