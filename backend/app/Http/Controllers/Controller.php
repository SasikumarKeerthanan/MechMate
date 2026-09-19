<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponseTrait;
use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
    use ApiResponseTrait;
}
