var COLORSCALE = {};

COLORSCALE.Inversion = false;
COLORSCALE.Smooth = true;
COLORSCALE.AlternativePalette = false;

const MIN_VALUE = 1.18e-38;

COLORSCALE.CreateScale = function(minValue, maxValue, numLevels)
{
  if (!PaletteCreated)
    CreatePalette();
  
  if ((numLevels < 1) || (maxValue < minValue))
    return false;

  var min_val = minValue;
  var max_val = maxValue;
  if (Math.abs(max_val - min_val) < MIN_VALUE)
  {
    min_val -= 1.0;
    max_val += 1.0;
  }

  var tmp_levels = []; // Длина numLevels 
  var tmp_colors = [];

  var size = max_val - min_val;
  var step = size / numLevels;

  var x = min_val + step * 0.5;
  for (var i = 0; i < numLevels; i++)
  {
    var tmpLevel = {};
    var tmpColor = {};
    tmpLevel.Value = x;
    
    var dev_value = 0.0;
    if (Math.abs(size) > MIN_VALUE)
    {
      var xx = (x - min_val) / size;
      if (i === 0)
        tmpColor = GetPaletteColor(0.0, dev_value);
      else if (i === numLevels - 1)
        tmpColor = GetPaletteColor(1.0, dev_value);
      else
        tmpColor = GetPaletteColor(xx, dev_value);
    }
    else
    {
      tmpColor = GetPaletteColor(0.0, dev_value);
    }
  
    tmpLevel.Devia = dev_value;
    tmp_levels.push(tmpLevel);
    tmp_colors.push(tmpColor);

    x += step;
  }   //  for (var i = 0; i < numLevels; i++)

  var colorScale = {};
  colorScale.Inversion = this.Inversion;
  colorScale.Smooth = this.Smooth;
  colorScale.AlternativePalette = this.AlternativePalette;
  colorScale.Colors = [];
  colorScale.Levels = [];

  colorScale.MinValue   = min_val;
  colorScale.MaxValue   = max_val;

  for (i = 0; i < tmp_levels.length; i++)
  {
    var level = tmp_levels[i];
    colorScale.Levels.push(level);
    var color = tmp_colors[i];
    colorScale.Colors.push(color);
  }

  colorScale.GetColor = function(value)
  {
    var nl = this.Colors.length;
    if (value <= this.Levels[0].Value)
      return this.Inversion ? this.Colors[nl - 1] : this.Colors[0];
  
    if (value >= this.Levels[nl - 1].Value)
      return this.Inversion ? this.Colors[0] : this.Colors[nl - 1];
  
    var rgb = !this.Inversion ? 
      {r: this.Colors[0].r, g: this.Colors[0].g, b: this.Colors[0].b} :
      {r: this.Colors[nl - 1].r, g: this.Colors[nl - 1].g, b: this.Colors[nl - 1].b};
  
    var hh = -1.0;
    var ss = 1.0;
    var vv = 1.0;
    for (var i = 0; i < nl - 1; i++)
    {
      var c1 = this.Inversion ? this.Colors[nl - i - 1] : this.Colors[i];
      var c2 = this.Inversion ? this.Colors[nl - i - 2] : this.Colors[i + 1];
  
      var hsv1 = ConvRgbToHsv(c1);
      var hsv2 = ConvRgbToHsv(c2);
  
      if (this.Levels[i].Value <= value && value < this.Levels[i + 1].Value)
      {
        if (this.Smooth)
        {
          var cf = (value - this.Levels[i].Value) /
                   (this.Levels[i + 1].Value - this.Levels[i].Value);
          if (this.AlternativePalette)
          {
            hh = (1.0 - cf) * hsv1.h  + cf * hsv2.h;
          }
          else // Go to alternative scale
          {
            // Correct with respect to sides
            var d1 = this.Levels[i].Devia;
            var d2 = this.Levels[i + 1].Devia;
        
            // Go to the standard palette
            hsv1.h += d1;
            hsv2.h += d2;
            if (hsv1.h === -1)
            {
              hh = hsv2.h;
            }
            else 
            if (hsv2.h === -1)
            {
              hh = hsv1.h;
            }
            else
            {
              hh = (1.0 - cf) * hsv1.h + cf * hsv2.h;
            }
  
            ss = (1.0 - cf) * hsv1.s + cf * hsv2.s;
            vv = ((1.0 - cf) * hsv1.v + cf * hsv2.v) / 255;
            var dev = DevToAltPalette(hh);
            hh -= dev;
          }
        }   // if (smooth)
        else
        {
          hh = hsv1.h;
        }
        break;
      }
    }    //  for (int i = 0; i < NumLevels() - 1; i++)
  
    var hsv = {h: hh, s: ss, v: vv};
    var rgb = ConvHsvToRgb(hsv);
  
    var r = rgb.r * 255.0;
    var g = rgb.g * 255.0;
    var b = rgb.b * 255.0;
  
    var color = {r: Math.floor(Clip(r, 0.0, 255.0)), 
                 g: Math.floor(Clip(g, 0.0, 255.0)), 
                 b: Math.floor(Clip(b, 0.0, 255.0))};
    return color;
  }

  return colorScale;
};

////////////////////////////////////////////////////////////
//                   Внутренние функции

var tolerance = 0.0001;
var CloseToZero = function(x)
{
  if ((x > -tolerance) && (x < tolerance))
    return true;

  return false;  
}

var AreEqual = function(x, y)
{
  return CloseToZero(x - y);  
}

var Clip = function (v, min_v, max_v)
{
  if (v < min_v)
    v = min_v;
  if (v > max_v)
    v = max_v;
  return v;
}

///////////////////////////////////////
//   V - светлота (0-1)
var ConvRgbToHsv = function(rgb)
{
  var rr = rgb.r;
  var gg = rgb.g;
  var bb = rgb.b;

  var hh = -1.0;

  // Определение светлоты
  var vv = Math.max(rr, gg, bb);

  // Определение насыщенности
  var tmp = Math.min(rr, gg, bb);

  var ss = 0;
  if (!CloseToZero(vv))
    ss =(vv - tmp) / vv;

  // Определение цветового тона
  if (!CloseToZero(ss))
  {
    var Cr = (vv - rr) / (vv - tmp);
    var Cg = (vv - gg) / (vv - tmp);
    var Cb = (vv - bb) / (vv - tmp);

    // Цвет между желтым и пурпурным
    if (AreEqual(rr, vv))
      hh = Cb - Cg;

    // Цвет между голубым и желтым
    if (AreEqual(gg, vv))
      hh = 2 + Cr - Cb;

    // Цвет между пурпурным и голубым
    if (AreEqual(bb, vv))
      hh = 4 + Cg - Cr;

    hh = hh * 60;

    // Приведение к положительным величинам
    if (hh < 0)
      hh += 360;
  }   //  if (!CloseToZero(ss))

  var hsv = {h: hh, s: ss, v: vv};    
  return hsv;
}   //  ConvRgbToHsv

///////////////////////////////////////////////////////////////////////////////
// H - (0-360)
// S - (0-1)
// V - (0-1)
//
// RGB - (0-1) each
var ConvHsvToRgb = function (hsv)
{
  var hh = hsv.h;
  var ss = hsv.s;
  var vv = hsv.v;

  var rgb = {};
  if (ss === 0)
  {
    rgb.r = vv;
    rgb.g = vv;
    rgb.b = vv;

    //if (hh != -1.0)
    return rgb;
  }

  var ihh = Math.floor(hh);
  if (ihh === 360)
  {
    hh = 0;
  }
  else
  {
    hh = hh / 60;
  }

  var i = Math.floor(hh);

  var f = hh - i;
  var m = vv * (1 - ss);
  var n = vv * (1 - ss * f);
  var k = vv * (1 - ss * (1 - f));

  if (i === 0)
  {
    rgb.r = vv;
    rgb.g = k;
    rgb.b = m;
  }
  else if (i === 1)
  {
    rgb.r = n;
    rgb.g = vv;
    rgb.b = m;
  }
  else if (i === 2)
  {
    rgb.r = m;
    rgb.g = vv;
    rgb.b = k;
  }
  else if (i === 3)
  {
    rgb.r = m;
    rgb.g = n;
    rgb.b = vv;
  }
  else if (i === 4)
  {
    rgb.r = k;
    rgb.g = m;
    rgb.b = vv;
  }
  else // if (i == 5)
  {
    rgb.r = vv;
    rgb.g = m;
    rgb.b = n;
  }
  
  return rgb;
}    //  ConvHsvToRgb

///////////////////////////////////////////
//               Палитра

const alternative_deviation = 10.0;
const PALETTE_LENGTH = 241;
var palette_std = [];
var palette_alt = [];
var deviation_values = [];
var PaletteCreated = false;

var GetPaletteColor = function(val, dev_val)
{
  var idx = Math.floor(val * (PALETTE_LENGTH - 1));
  dev_val = 0.0;
  if (COLORSCALE.AlternativePalette)
  {
    dev_val = deviation_values[idx];
    return palette_alt[idx];
  }

  return palette_std[idx];
}

var DevToAltPalette = function(h)
{
  // int PALETTE_LENGTH = 241;
  var PALETTE_HALF_LENGTH = 120;

  var del_alt = 0.0;
  if (h >= 0 && h <= PALETTE_HALF_LENGTH)
  {
    var cf = (h - 60.0) / 60.0;
    if (cf < -1 || cf > 1)
      del_alt = 0.0;
    else
      del_alt = alternative_deviation * Math.sin(2 * Math.asin(cf));
  }
  else
  {
    cf = (h - 180.0) / 60.0;
    if (cf < -1 || cf > 1)
      del_alt = 0.0;
    else
      del_alt = alternative_deviation * Math.sin(2 * Math.asin(cf));
  }

  return del_alt;
}  // DevToAltPalette

var CreatePalette = function()
{
  for (var i = 0; i < PALETTE_LENGTH; i++)
  {
    var hsv = {h: i, s: 1.0, v: 1.0};
    var rgb1 = ConvHsvToRgb(hsv);
    
    var r1 = Math.floor(Clip(rgb1.r * 255, 0, 255));
    var g1 = Math.floor(Clip(rgb1.g * 255, 0, 255));
    var b1 = Math.floor(Clip(rgb1.b * 255, 0, 255));
    
    var c1 = {r: r1, g: g1, b: b1};
    palette_std[PALETTE_LENGTH - i - 1] = c1;
        
    var del_alt = DevToAltPalette(hsv.h);
    hsv.h -= del_alt;
    var rgb2 = ConvHsvToRgb(hsv);
    
    var r2 = Math.floor(Clip(rgb2.r * 255, 0, 255));
    var g2 = Math.floor(Clip(rgb2.g * 255, 0, 255));
    var b2 = Math.floor(Clip(rgb2.b * 255, 0, 255));

    var c2 = {r: r2, g: g2, b: b2};
    palette_alt[PALETTE_LENGTH - i - 1] = c2;
    deviation_values[PALETTE_LENGTH - i - 1] = del_alt;
  }

  PaletteCreated = true;
};
export default COLORSCALE;
