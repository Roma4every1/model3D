import type { TabsProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { Tabs } from 'antd';
import { MapStage } from 'features/map/lib/map-stage';
import { LayerTreeLeaf } from 'features/map/components/layer-tree/layer-tree-leaf';
import { useProfileState } from '../store/profile.store';
import { ProfileParameterEditor } from './profile-parameters';
import './profile.scss';


interface ProfileLayerTabProps {
  stage: MapStage;
  layers: IMapLayer[];
}


export const ProfileEditor = ({id}: {id: FormID}) => {
  const { t } = useTranslation();
  const state = useProfileState(id);
  if (!state) return null;

  const { stage, parameters } = state;
  const layers = stage.getMapData()?.layers;

  const tabs: TabsProps['items'] = [
    {
      key: '1', label: t('profile.tab-parameters'),
      children: <ProfileParameterEditor id={id} parameters={parameters}/>,
    },
    {
      key: '2', label: t('profile.tab-layers'), disabled: !layers,
      children: <ProfileLayers stage={stage as MapStage} layers={layers}/>,
    },
  ];
  return <Tabs className={'profile-editor'} items={tabs} size={'middle'}/>;
};

const ProfileLayers = ({layers, stage}: ProfileLayerTabProps) => {
  if (!layers || layers.length === 0) return null;
  return layers.map((l: IMapLayer) => <LayerTreeLeaf key={l.id} layer={l} stage={stage}/>);
};
