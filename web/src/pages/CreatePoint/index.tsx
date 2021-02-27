import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMapEvent } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';

import './styles.css';
import logo from '../../assets/logo.svg';

interface Item {
	id: number;
	title: string;
	image_url: string;
}

interface UFs {
	sigla: string;
}

interface Cities {
	nome: string;
}

const CreatePoint = () => {
	const [items, setItems] = useState<Item[]>([]);
	const [UFs, setUFs] = useState<string[]>([]);
	const [cities, setCities] = useState<string[]>([]);

	const [selectedUf, setSelectedUf] = useState('0');
	const [selectedCity, setSelectedCity] = useState('0');
	const [selectedItems, setSelectedItems] = useState<number[]>([]);

	const [initalPosition, setInitalPosition] = useState<[number, number]>([0, 0]);
	const [selectedPosition, setSelectedPosition] = useState<[number, number]>([-23.58429, -46.52699]);

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		whatsapp: ''
	})

	const history = useHistory();

	// geolocation was returning wrong position cords
	useEffect(() => {
		navigator.geolocation.getCurrentPosition(position => {
			const { latitude, longitude } = position.coords;
			setInitalPosition([latitude, longitude])
		})
	}, [])

	useEffect(() => {
		api.get('items').then(response => {
			setItems(response.data);
		})
	}, [])

	useEffect(() => {
		axios.get<UFs[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
			const ufInitials = response.data.map(uf => uf.sigla);
			setUFs(ufInitials);
		})
	}, [])

	useEffect(() => {
		if (selectedUf === '0') return;

		axios.get<Cities[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
			const cities = response.data.map(city => city.nome);
			setCities(cities);
		})
	}, [selectedUf])

	function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
		const uf = event.target.value;
		setSelectedUf(uf);
	}

	function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
		const city = event.target.value;
		setSelectedCity(city);
	}

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value })
	}

	function handleSelectItem(id: number) {
		const alreadySelected = selectedItems.includes(id);

		if (alreadySelected) {
			const filteredItems = selectedItems.filter(item => item !== id);
			setSelectedItems(filteredItems);
		} else {
			setSelectedItems([...selectedItems, id]);
		}
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();

		const { name, email, whatsapp } = formData;
		const [latitude, longitude] = selectedPosition;
		const city = selectedCity;
		const uf = selectedUf;
		const items = selectedItems;

		const data = {
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
			items
		}

		await api.post('points', data).then(response => {

			if (response.status !== 200) {
				alert('Erro ao criar ponto de coleta.');
			} else {
				const success = document.querySelector<HTMLElement>(".success-message")!;
				success.style.visibility = 'visible';

				setTimeout(() => {
					history.push('/');
				}, 2000);
			}

		});
	}

	function MyComponent() {
		const map = useMapEvent('click', (event) => {
			setSelectedPosition([
				event.latlng.lat,
				event.latlng.lng
			])
		})
		return null
	}

	return (
		<div id="page-create-point">
			<header>
				<img src={logo} alt="Ecoleta" />

				<Link to="/">
					<FiArrowLeft />
					Voltar para home
				</Link>
			</header>

			<form onSubmit={handleSubmit}>
				<h1>Cadastro do <br /> ponto de coleta</h1>

				<fieldset>
					<legend>
						<h2>Dados</h2>
					</legend>

					<div className="field">
						<label htmlFor="name">Nome da entidade</label>
						<input
							type="text"
							id="name"
							name="name"
							onChange={handleInputChange}
						/>
					</div>

					<div className="field-group">
						<div className="field">
							<label htmlFor="email">E-mail</label>
							<input
								type="email"
								id="email"
								name="email"
								onChange={handleInputChange}
							/>
						</div>

						<div className="field">
							<label htmlFor="name">Whatsapp</label>
							<input
								type="text"
								id="whatsapp"
								name="whatsapp"
								onChange={handleInputChange}
							/>
						</div>
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2>Endereço</h2>
						<span>Selecione o endereço do mapa</span>
					</legend>

					<MapContainer center={[-23.58429, -46.52699]} zoom={15}>
						<TileLayer
							attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>

						<MyComponent />

						<Marker
							draggable={true}
							position={selectedPosition}
						/>
					</MapContainer>

					<div className="field-group">
						<div className="field">
							<label htmlFor="uf">Estado (UF)</label>
							<select name="uf" id="uf" value={selectedUf} onChange={handleSelectUF}>
								<option value="0">Selecione uma UF</option>
								{UFs.map(uf => (
									<option key={uf} value={uf}>{uf}</option>
								))}
							</select>
						</div>

						<div className="field">
							<label htmlFor="city">Cidade</label>
							<select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
								<option value="0">Selecione uma Cidade</option>
								{cities.map(city => (
									<option key={city} value={city}>{city}</option>
								))}
							</select>
						</div>
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2>Items de coleta</h2>
						<span>Selecione um ou mais itens abaixo</span>
					</legend>

					<ul className="items-grid">
						{items.map(item => (
							<li
								key={item.id}
								onClick={() => handleSelectItem(item.id)}
								className={selectedItems.includes(item.id) ? 'selected' : ''}
							>
								<img src={item.image_url} alt={item.title} />
								<span>{item.title}</span>
							</li>
						))}
					</ul>
				</fieldset>

				<button type="submit">
					Cadastrar ponto de coleta
				</button>
			</form>

			<div className="success-message">
				<FiCheckCircle />
				<span>Cadastro concluído!</span>
			</div>
		</div>
	)
}

export default CreatePoint;