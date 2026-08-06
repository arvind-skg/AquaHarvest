import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createFullAssessment } from '../services/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// ── Form initial state ───────────────────────────────────────────
const INITIAL = {
  owner_name: '',
  building_name: '',
  address: '',
  district: '',
  property_type: 'Residential',
  roof_length: '',
  roof_width: '',
  roof_material: 'Concrete',
  roof_type: 'Flat',
  rainfall: '',
  soil_type: 'Sandy',
  groundwater_level: '',
  open_space: '',
  occupants: '',
  budget: '',
  latitude: null,
  longitude: null,
};

const STEPS = [
  { title: 'Property Details', icon: '🏠', desc: 'Owner and building information' },
  { title: 'Roof Details', icon: '🏗️', desc: 'Roof dimensions and material' },
  { title: 'Environment', icon: '🌿', desc: 'Rainfall, soil and site conditions' },
];

// Map pin picker for step 3
function MapPinPicker({ onPick }) {
  const [pos, setPos] = useState([20.5937, 78.9629]);
  useMapEvents({
    click(e) {
      setPos([e.latlng.lat, e.latlng.lng]);
      onPick(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    },
  });
  return <Marker position={pos} />;
}

// Field wrapper
function Field({ label, hint, children, required }) {
  return (
    <div className="space-y-1.5">
      <label className="form-label">
        {label}
        {required && <span className="text-aqua-400 ml-1">*</span>}
        {hint && <span className="ml-2 text-slate-600 normal-case font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

// Select helper
function Select({ name, value, onChange, options, disabled }) {
  return (
    <select name={name} value={value} onChange={onChange} disabled={disabled} className="input-field">
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

export default function Assessment() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const roofArea = form.roof_length && form.roof_width
    ? (parseFloat(form.roof_length) * parseFloat(form.roof_width)).toFixed(1)
    : null;

  const update = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Step validation
  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!form.owner_name.trim()) errs.owner_name = 'Required';
      if (!form.building_name.trim()) errs.building_name = 'Required';
      if (!form.address.trim()) errs.address = 'Required';
      if (!form.district.trim()) errs.district = 'Required';
    }
    if (step === 1) {
      if (!form.roof_length || parseFloat(form.roof_length) <= 0) errs.roof_length = 'Must be > 0';
      if (!form.roof_width  || parseFloat(form.roof_width)  <= 0) errs.roof_width  = 'Must be > 0';
    }
    if (step === 2) {
      if (!form.rainfall || parseFloat(form.rainfall) <= 0) errs.rainfall = 'Required';
      if (!form.groundwater_level || parseFloat(form.groundwater_level) <= 0) errs.groundwater_level = 'Required';
      if (!form.open_space || parseFloat(form.open_space) <= 0) errs.open_space = 'Required';
      if (!form.occupants || parseInt(form.occupants) <= 0) errs.occupants = 'Required';
      if (!form.budget || parseFloat(form.budget) <= 0) errs.budget = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);

    const payload = {
      ...form,
      roof_length: parseFloat(form.roof_length),
      roof_width:  parseFloat(form.roof_width),
      rainfall:    parseFloat(form.rainfall),
      groundwater_level: parseFloat(form.groundwater_level),
      open_space:  parseFloat(form.open_space),
      occupants:   parseInt(form.occupants),
      budget:      parseFloat(form.budget),
    };

    try {
      const { data } = await createFullAssessment(payload);
      navigate('/results', { state: { result: data } });
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.response?.data ? JSON.stringify(err.response.data) : 'Server error. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  const stepContent = [
    // Step 0: Property Details
    <div key="step0" className="grid gap-5 md:grid-cols-2">
      <Field label="Owner Name" required>
        <input name="owner_name" value={form.owner_name} onChange={update} placeholder="e.g. Rajesh Kumar" className={`input-field ${errors.owner_name ? 'border-red-500/60' : ''}`} />
        {errors.owner_name && <p className="text-red-400 text-xs mt-1">{errors.owner_name}</p>}
      </Field>
      <Field label="Building Name" required>
        <input name="building_name" value={form.building_name} onChange={update} placeholder="e.g. Sunrise Apartments" className={`input-field ${errors.building_name ? 'border-red-500/60' : ''}`} />
        {errors.building_name && <p className="text-red-400 text-xs mt-1">{errors.building_name}</p>}
      </Field>
      <Field label="Address" required>
        <input name="address" value={form.address} onChange={update} placeholder="Street, Colony, City" className={`input-field ${errors.address ? 'border-red-500/60' : ''}`} />
        {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
      </Field>
      <Field label="District" required>
        <input name="district" value={form.district} onChange={update} placeholder="e.g. Pune" className={`input-field ${errors.district ? 'border-red-500/60' : ''}`} />
        {errors.district && <p className="text-red-400 text-xs mt-1">{errors.district}</p>}
      </Field>
      <Field label="Property Type">
        <Select name="property_type" value={form.property_type} onChange={update}
          options={['Residential', 'Commercial', 'Institutional', 'Industrial']} />
      </Field>
    </div>,

    // Step 1: Roof Details
    <div key="step1" className="grid gap-5 md:grid-cols-2">
      <Field label="Roof Length" hint="(meters)" required>
        <input type="number" name="roof_length" value={form.roof_length} onChange={update} placeholder="e.g. 15" min="1" step="0.1"
          className={`input-field ${errors.roof_length ? 'border-red-500/60' : ''}`} />
        {errors.roof_length && <p className="text-red-400 text-xs mt-1">{errors.roof_length}</p>}
      </Field>
      <Field label="Roof Width" hint="(meters)" required>
        <input type="number" name="roof_width" value={form.roof_width} onChange={update} placeholder="e.g. 10" min="1" step="0.1"
          className={`input-field ${errors.roof_width ? 'border-red-500/60' : ''}`} />
        {errors.roof_width && <p className="text-red-400 text-xs mt-1">{errors.roof_width}</p>}
      </Field>

      {/* Auto-calculated area */}
      {roofArea && (
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-aqua-500/10 border border-aqua-500/20">
            <span className="text-2xl">📐</span>
            <div>
              <p className="text-xs text-aqua-400 font-medium uppercase tracking-wider">Auto-calculated Roof Area</p>
              <p className="text-2xl font-bold text-white">{roofArea} <span className="text-sm text-slate-400 font-normal">m²</span></p>
            </div>
          </div>
        </div>
      )}

      <Field label="Roof Material">
        <Select name="roof_material" value={form.roof_material} onChange={update}
          options={['Concrete', 'Metal', 'Tile', 'Asbestos']} />
      </Field>
      <Field label="Roof Type">
        <Select name="roof_type" value={form.roof_type} onChange={update}
          options={['Flat', 'Pitched', 'Sloped']} />
      </Field>

      {/* Runoff preview */}
      <div className="md:col-span-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400">
        <span className="text-slate-300 font-medium">Runoff Coefficient: </span>
        {{ Concrete: '0.85', Metal: '0.90', Tile: '0.75', Asbestos: '0.80' }[form.roof_material] || '0.80'}
        {' '}<span className="text-slate-600">— affects harvest potential calculation</span>
      </div>
    </div>,

    // Step 2: Environment + Map
    <div key="step2" className="grid gap-5 md:grid-cols-2">
      <Field label="Annual Rainfall" hint="(mm/year)" required>
        <input type="number" name="rainfall" value={form.rainfall} onChange={update} placeholder="e.g. 800" min="100" max="5000"
          className={`input-field ${errors.rainfall ? 'border-red-500/60' : ''}`} />
        {errors.rainfall && <p className="text-red-400 text-xs mt-1">{errors.rainfall}</p>}
      </Field>
      <Field label="Soil Type">
        <Select name="soil_type" value={form.soil_type} onChange={update}
          options={['Sandy', 'Clayey', 'Loamy', 'Gravelly']} />
      </Field>
      <Field label="Groundwater Level" hint="(meters depth)" required>
        <input type="number" name="groundwater_level" value={form.groundwater_level} onChange={update} placeholder="e.g. 10" min="1" max="200"
          className={`input-field ${errors.groundwater_level ? 'border-red-500/60' : ''}`} />
        {errors.groundwater_level && <p className="text-red-400 text-xs mt-1">{errors.groundwater_level}</p>}
      </Field>
      <Field label="Available Open Space" hint="(m²)" required>
        <input type="number" name="open_space" value={form.open_space} onChange={update} placeholder="e.g. 25" min="0"
          className={`input-field ${errors.open_space ? 'border-red-500/60' : ''}`} />
        {errors.open_space && <p className="text-red-400 text-xs mt-1">{errors.open_space}</p>}
      </Field>
      <Field label="Number of Occupants" required>
        <input type="number" name="occupants" value={form.occupants} onChange={update} placeholder="e.g. 4" min="1" max="5000"
          className={`input-field ${errors.occupants ? 'border-red-500/60' : ''}`} />
        {errors.occupants && <p className="text-red-400 text-xs mt-1">{errors.occupants}</p>}
      </Field>
      <Field label="Budget" hint="(₹ INR)" required>
        <input type="number" name="budget" value={form.budget} onChange={update} placeholder="e.g. 500000" min="5000"
          className={`input-field ${errors.budget ? 'border-red-500/60' : ''}`} />
        {errors.budget && <p className="text-red-400 text-xs mt-1">{errors.budget}</p>}
      </Field>

      {/* Map location picker */}
      <div className="md:col-span-2 space-y-2">
        <label className="form-label">📍 Site Location <span className="text-slate-600 normal-case font-normal">(optional — click to mark)</span></label>
        <div className="h-[220px] rounded-2xl overflow-hidden border border-white/[0.08]">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapPinPicker onPick={(lat, lng) => setForm((p) => ({ ...p, latitude: lat, longitude: lng }))} />
          </MapContainer>
        </div>
        {form.latitude && (
          <p className="text-xs font-mono text-aqua-400">
            📍 {form.latitude}°N, {form.longitude}°E
          </p>
        )}
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-xs font-mono text-aqua-400 uppercase tracking-[0.25em] mb-2">Site Assessment</p>
          <h1 className="text-3xl font-bold text-white">Analyze Your Site</h1>
          <p className="text-slate-400 mt-2 text-sm">Fill in your building details to get an AI-powered rainwater harvesting recommendation.</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`progress-dot border-2 transition-all ${
                  i < step ? 'bg-aqua-500 border-aqua-500 text-white' :
                  i === step ? 'border-aqua-400 text-aqua-400 bg-aqua-500/10' :
                  'border-slate-700 text-slate-600 bg-transparent'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <p className={`text-[10px] font-semibold ${i <= step ? 'text-white' : 'text-slate-600'}`}>{s.title}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`progress-line mx-2 -mt-4 sm:-mt-5 ${i < step ? 'active' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          key={`card-${step}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 lg:p-8"
        >
          {/* Step Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aqua-500/20 to-ocean-500/10 border border-aqua-500/20 flex items-center justify-center text-xl">
              {STEPS[step].icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{STEPS[step].title}</h2>
              <p className="text-xs text-slate-500">{STEPS[step].desc}</p>
            </div>
            <div className="ml-auto text-xs font-mono text-slate-500">
              Step {step + 1} / {STEPS.length}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          {errors.submit && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              ⚠ {errors.submit}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/[0.06]">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className="btn-ghost disabled:opacity-30"
            >
              ← Back
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={nextStep} className="btn-primary">
                Continue → {STEPS[step + 1]?.icon}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary min-w-[160px] justify-center"
                id="analyze-site-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Analyzing Site...
                  </span>
                ) : (
                  <>🔍 Analyze Site</>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
