import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoaderSpinner from '../components/LoaderSpinner';

const QualificationDetails = () => {
    const [qualifications, setQualifications] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        employeeId: '',
        qualificationName: '',
        qualificationType: 'education',
        category: 'graduate',
        institutionName: '',
        amount: '',
        description: '',
        degreeName: '',
        board: '',
        passingYear: '',
        percentage: '',
        grade: '',
        specialization: '',
        trainingDuration: '',
        startDate: '',
        endDate: '',
        certificateNumber: '',
        validUntil: ''
    });

    useEffect(() => {
        fetchQualifications();
        fetchEmployees();
    }, [selectedEmployee]);

    const fetchQualifications = async () => {
        setLoading(true);
        try {
            const url = selectedEmployee 
                ? `http://localhost:5000/api/qualification?employeeId=${selectedEmployee}`
                : 'http://localhost:5000/api/qualification';
            const response = await axios.get(url);
            setQualifications(response.data);
        } catch (error) {
            console.error('Error fetching qualifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/employee');
            setEmployees(response.data);
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
            if (editingId) {
                await axios.put(`http://localhost:5000/api/qualification/${editingId}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/qualification', formData);
            }
            fetchQualifications();
            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error('Error saving qualification:', error);
            alert('શિક્ષણ વિગત સેવ કરવામાં ભૂલ');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            employeeId: '',
            qualificationName: '',
            qualificationType: 'education',
            category: 'graduate',
            institutionName: '',
            amount: '',
            description: '',
            degreeName: '',
            board: '',
            passingYear: '',
            percentage: '',
            grade: '',
            specialization: '',
            trainingDuration: '',
            startDate: '',
            endDate: '',
            certificateNumber: '',
            validUntil: ''
        });
    };

    const handleEdit = (qual) => {
        setEditingId(qual._id);
        setFormData({
            employeeId: qual.employeeId._id,
            qualificationName: qual.qualificationName,
            qualificationType: qual.qualificationType,
            category: qual.category,
            institutionName: qual.institutionName,
            amount: qual.amount || '',
            description: qual.description || '',
            degreeName: qual.degreeName || '',
            board: qual.board || '',
            passingYear: qual.passingYear || '',
            percentage: qual.percentage || '',
            grade: qual.grade || '',
            specialization: qual.specialization || '',
            trainingDuration: qual.trainingDuration || '',
            startDate: qual.startDate ? qual.startDate.split('T')[0] : '',
            endDate: qual.endDate ? qual.endDate.split('T')[0] : '',
            certificateNumber: qual.certificateNumber || '',
            validUntil: qual.validUntil ? qual.validUntil.split('T')[0] : ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('શું તમે આ શિક્ષણ વિગત ડિલીટ કરવા માંગો છો?')) {
            try {
                await axios.delete(`http://localhost:5000/api/qualification/${id}`);
                fetchQualifications();
            } catch (error) {
                console.error('Error deleting qualification:', error);
            }
        }
    };

    const verifyQualification = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/qualification/${id}/verify`, {
                status,
                verifiedBy: 'Admin',
                verifiedAt: new Date()
            });
            fetchQualifications();
        } catch (error) {
            console.error('Error verifying qualification:', error);
        }
    };

    const getCategoryLabel = (category) => {
        const categories = {
            primary: 'પ્રાથમિક',
            secondary: 'માધ્યમિક',
            higher_secondary: 'ઉચ્ચતર માધ્યમિક',
            graduate: 'સ્નાતક',
            post_graduate: 'અનુસ્નાતક',
            diploma: 'ડિપ્લોમા',
            certificate: 'પ્રમાણપત્ર',
            professional: 'વ્યવસાયિક',
            vocational: 'વ્યાવસાયિક',
            other: 'અન્ય'
        };
        return categories[category] || category;
    };

    const getTypeLabel = (type) => {
        const types = {
            education: 'શિક્ષણ',
            training: 'તાલીમ',
            certification: 'પ્રમાણપત્ર',
            skill: 'કૌશલ્ય',
            workshop: 'વર્કશોપ'
        };
        return types[type] || type;
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">ઉપાડણી વિગત (Qualification Details)</h1>
                <p className="text-gray-600 mt-1">કર્મચારીઓની શિક્ષણ અને તાલીમ વિગતો</p>
            </div>

            {/* Filters */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <label className="font-medium text-gray-700">કર્મચારી:</label>
                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md w-64"
                    >
                        <option value="">બધા કર્મચારીઓ</option>
                        {employees.map(emp => (
                            <option key={emp._id} value={emp._id}>
                                {emp.employeeCode} - {emp.firstName} {emp.lastName}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    {showForm ? 'ફોર્મ બંધ કરો' : '+ નવી વિગત ઉમેરો'}
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        {editingId ? 'વિગત સુધારો' : 'નવી શિક્ષણ/તાલીમ વિગત'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">સમ્મેલિનુ નામ *</label>
                                <input type="text" name="qualificationName" value={formData.qualificationName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">સમ્મેલિનુ જ્વલ (Type) *</label>
                                <select name="qualificationType" value={formData.qualificationType} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                                    <option value="education">શિક્ષણ</option>
                                    <option value="training">તાલીમ</option>
                                    <option value="certification">પ્રમાણપત્ર</option>
                                    <option value="skill">કૌશલ્ય</option>
                                    <option value="workshop">વર્કશોપ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">સમ્મેલીના કાંઠી (Category) *</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                                    <option value="primary">પ્રાથમિક શિક્ષણ</option>
                                    <option value="secondary">માધ્યમિક શિક્ષણ</option>
                                    <option value="higher_secondary">ઉચ્ચતર માધ્યમિક</option>
                                    <option value="graduate">સ્નાતક</option>
                                    <option value="post_graduate">અનુસ્નાતક</option>
                                    <option value="diploma">ડિપ્લોમા</option>
                                    <option value="certificate">પ્રમાણપત્ર</option>
                                    <option value="professional">વ્યવસાયિક</option>
                                    <option value="vocational">વ્યાવસાયિક</option>
                                    <option value="other">અન્ય</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ગૃહીતની ફાર (Institution) *</label>
                                <input type="text" name="institutionName" value={formData.institutionName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ગૃહીતની રમ (Amount) ₹</label>
                                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                        </div>

                        {/* Education Specific Fields */}
                        {formData.qualificationType === 'education' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ડિગ્રીનું નામ</label>
                                    <input type="text" name="degreeName" value={formData.degreeName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">બોર્ડ/યુનિવર્સિટી</label>
                                    <input type="text" name="board" value={formData.board} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">પાસિંગ વર્ષ</label>
                                    <input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">પર્સેન્ટેજ (%)</label>
                                    <input type="number" name="percentage" value={formData.percentage} onChange={handleChange} step="0.01" className="w-full px-3 py-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ગ્રેડ</label>
                                    <input type="text" name="grade" value={formData.grade} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">વિશેષતા</label>
                                    <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                                </div>
                            </div>
                        )}

                        {/* Training Specific Fields */}
                        {(formData.qualificationType === 'training' || formData.qualificationType === 'certification') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">તાલીમ અવધિ (દિવસો)</label>
                                    <input type="number" name="trainingDuration" value={formData.trainingDuration} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">પ્રારંભ તારીખ</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">સમાપ્તિ તારીખ</label>
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">પ્રમાણપત્ર નંબર</label>
                                    <input type="text" name="certificateNumber" value={formData.certificateNumber} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">માન્યતા સુધી</label>
                                    <input type="date" name="validUntil" value={formData.validUntil} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">વિશ્વો (Description)</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-3 py-2 border rounded-md"></textarea>
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

            {/* Qualifications Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && qualifications.length === 0 ? (
                    <div className="col-span-full text-center py-10"><LoaderSpinner /></div>
                ) : qualifications.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">કોઈ શિક્ષણ/તાલીમ વિગત નથી</div>
                ) : (
                    qualifications.map(qual => (
                        <div key={qual._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                            <div className={`p-4 ${qual.qualificationType === 'education' ? 'bg-blue-600' : 'bg-green-600'} text-white`}>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-lg">{qual.qualificationName}</h3>
                                    <span className="px-2 py-1 text-xs bg-white bg-opacity-20 rounded-full">
                                        {getTypeLabel(qual.qualificationType)}
                                    </span>
                                </div>
                                <p className="text-sm mt-1 opacity-90">{qual.employeeId?.firstName} {qual.employeeId?.lastName}</p>
                            </div>
                            <div className="p-4">
                                <div className="space-y-2 text-sm">
                                    <p><strong>સમ્મેલીના કાંઠી:</strong> {getCategoryLabel(qual.category)}</p>
                                    <p><strong>ગૃહીતની ફાર:</strong> {qual.institutionName}</p>
                                    {qual.degreeName && <p><strong>ડિગ્રી:</strong> {qual.degreeName}</p>}
                                    {qual.passingYear && <p><strong>પાસિંગ વર્ષ:</strong> {qual.passingYear} {qual.percentage && `| ${qual.percentage}%`}</p>}
                                    {qual.amount > 0 && <p><strong>ગૃહીતની રમ:</strong> ₹{qual.amount.toLocaleString()}</p>}
                                    {qual.description && <p><strong>વિશ્વો:</strong> <span className="text-gray-600">{qual.description}</span></p>}
                                </div>
                                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                                    <select
                                        value={qual.status}
                                        onChange={(e) => verifyQualification(qual._id, e.target.value)}
                                        className={`px-2 py-1 text-xs rounded border ${qual.status === 'verified' ? 'bg-green-100 text-green-800' : qual.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                                    >
                                        <option value="pending">⏳ બાકી</option>
                                        <option value="verified">✓ ચકાસાયેલ</option>
                                        <option value="rejected">✗ નામંજૂર</option>
                                    </select>
                                    <div>
                                        <button onClick={() => handleEdit(qual)} className="text-blue-600 hover:text-blue-900 mr-2">✏️</button>
                                        <button onClick={() => handleDelete(qual._id)} className="text-red-600 hover:text-red-900">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">કુલ વિગતો</h3>
                    <p className="text-2xl font-bold text-gray-800">{qualifications.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">શિક્ષણ</h3>
                    <p className="text-2xl font-bold text-blue-600">{qualifications.filter(q => q.qualificationType === 'education').length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">તાલીમ/પ્રમાણપત્ર</h3>
                    <p className="text-2xl font-bold text-green-600">{qualifications.filter(q => q.qualificationType === 'training' || q.qualificationType === 'certification').length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <h3 className="text-sm text-gray-500">ચકાસાયેલ</h3>
                    <p className="text-2xl font-bold text-green-600">{qualifications.filter(q => q.status === 'verified').length}</p>
                </div>
            </div>
        </div>
    );
};

export default QualificationDetails;