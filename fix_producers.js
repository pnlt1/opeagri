const fs = require('fs');

const path = 'c:/ZBOOK/Projets App/SAAS/Opeagri/opeagri-web/src/app/(dashboard)/producteurs/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix the toast error in fetchProducers
content = content.replace(
  'toast({ title: "Erreur", description: error.message, variant: "destructive" });',
  'toast(`Erreur: ${error.message}`);'
);

// Rewrite handleAddProducer
const oldAdd = `  const handleAddProducer = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = \`PRD-2026-\${String(producersList.length + 1).padStart(3, '0')}\`;
    const newProducer = {
      id: newId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      village: formData.village,
      cooperative: formData.cooperative || "Indépendant",
      phone: formData.phone,
      area: parseFloat(formData.area) || 0,
      status: "Actif"
    };
    
    setProducersList([newProducer, ...producersList]);
    setIsModalOpen(false);
    toast(\`Producteur \${newProducer.firstName} \${newProducer.lastName} ajouté avec succès !\`);
    setFormData({ firstName: "", lastName: "", phone: "", village: "", cooperative: "", area: "" }); // Reset
  };`;

const newAdd = `  const handleAddProducer = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('producers').insert([{
      first_name: formData.firstName,
      last_name: formData.lastName,
      village: formData.village,
      cooperative: formData.cooperative || "Indépendant",
      phone: formData.phone,
      area_ha: parseFloat(formData.area) || 0,
      status: "Actif"
    }]);

    if (error) {
      toast(\`Erreur: \${error.message}\`);
    } else {
      setIsModalOpen(false);
      toast(\`Producteur \${formData.firstName} \${formData.lastName} ajouté avec succès !\`);
      setFormData({ firstName: "", lastName: "", phone: "", village: "", cooperative: "", area: "" });
      fetchProducers();
    }
  };`;
content = content.replace(oldAdd, newAdd);

// Rewrite handleEditSubmit
const oldEdit = `  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProducer) return;
    setProducersList(prev => prev.map(p => p.id === editingProducer.id ? editingProducer : p));
    setEditingProducer(null);
    toast(\`Producteur \${editingProducer.firstName} mis à jour avec succès !\`);
  };`;

const newEdit = `  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProducer) return;
    
    const { error } = await supabase.from('producers').update({
      first_name: editingProducer.firstName,
      last_name: editingProducer.lastName,
      village: editingProducer.village,
      cooperative: editingProducer.cooperative,
      phone: editingProducer.phone,
      area_ha: editingProducer.area,
      status: editingProducer.status
    }).eq('id', editingProducer.id);

    if (error) {
      toast(\`Erreur: \${error.message}\`);
    } else {
      setEditingProducer(null);
      toast(\`Producteur \${editingProducer.firstName || editingProducer.first_name} mis à jour avec succès !\`);
      fetchProducers();
    }
  };`;
content = content.replace(oldEdit, newEdit);

fs.writeFileSync(path, content);
console.log("Fixed toast error and updated CRUD logic.");
